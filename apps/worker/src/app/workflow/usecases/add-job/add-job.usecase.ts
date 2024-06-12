import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { JobEntity, JobRepository, JobStatusEnum } from '@novu/dal';
import {
  DigestCreationResultEnum,
  DigestTypeEnum,
  ExecutionDetailsSourceEnum,
  ExecutionDetailsStatusEnum,
  StepTypeEnum,
} from '@novu/shared';

import { AddDelayJob } from './add-delay-job.usecase';
import { MergeOrCreateDigestCommand } from './merge-or-create-digest.command';
import { MergeOrCreateDigest } from './merge-or-create-digest.usecase';
import { AddJobCommand } from './add-job.command';
import { validateDigest } from './validation';
import { ModuleRef } from '@nestjs/core';
import {
  CalculateDelayService,
  ConditionsFilter,
  ConditionsFilterCommand,
  DetailEnum,
  ExecuteOutput,
  ExecutionLogRoute,
  ExecutionLogRouteCommand,
  IChimeraDigestResponse,
  IFilterVariables,
  InstrumentUsecase,
  IUseCaseInterfaceInline,
  JobsOptions,
  LogDecorator,
  requireInject,
  StandardQueueService,
} from '@novu/application-generic';

export enum BackoffStrategiesEnum {
  WEBHOOK_FILTER_BACKOFF = 'webhookFilterBackoff',
}

const LOG_CONTEXT = 'AddJob';

@Injectable()
export class AddJob {
  private resonateUsecase: IUseCaseInterfaceInline;

  constructor(
    private jobRepository: JobRepository,
    @Inject(forwardRef(() => StandardQueueService))
    private standardQueueService: StandardQueueService,
    @Inject(forwardRef(() => ExecutionLogRoute))
    private executionLogRoute: ExecutionLogRoute,
    private mergeOrCreateDigestUsecase: MergeOrCreateDigest,
    private addDelayJob: AddDelayJob,
    @Inject(forwardRef(() => CalculateDelayService))
    private calculateDelayService: CalculateDelayService,
    @Inject(forwardRef(() => ConditionsFilter))
    private conditionsFilter: ConditionsFilter,
    private moduleRef: ModuleRef
  ) {
    this.resonateUsecase = requireInject('resonate', this.moduleRef);
  }

  @InstrumentUsecase()
  @LogDecorator()
  public async execute(command: AddJobCommand): Promise<void> {
    Logger.verbose('Getting Job', LOG_CONTEXT);
    const job = command.job;
    Logger.debug(`Job contents for job ${job._id}`, job, LOG_CONTEXT);

    if (!job) {
      Logger.warn(`Job was null in both the input and search`, LOG_CONTEXT);

      return;
    }

    Logger.log(`Scheduling New Job ${job._id} of type: ${job.type}`, LOG_CONTEXT);

    if (isJobDeferredType(job.type)) {
      await this.executeDeferredJob(command);
    } else {
      await this.executeNoneDeferredJob(command);
    }

    await this.executionLogRoute.execute(
      ExecutionLogRouteCommand.create({
        ...ExecutionLogRouteCommand.getDetailsFromJob(job),
        detail: DetailEnum.STEP_QUEUED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.PENDING,
        isTest: false,
        isRetry: false,
      })
    );
  }

  private async executeDeferredJob(command: AddJobCommand): Promise<void> {
    const job = command.job;

    let digestAmount: number | undefined;
    let delayAmount: number | undefined = undefined;

    const shouldRun = await this.conditionsFilter.filter(
      ConditionsFilterCommand.create({
        filters: job.step.filters || [],
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        userId: command.userId,
        step: job.step,
        job,
      })
    );

    const filterVariables = shouldRun.variables;
    const filtered = !shouldRun.passed;

    if (job.type === StepTypeEnum.DIGEST) {
      const digestResult = await this.handleDigest(command, filterVariables, job, digestAmount, filtered);

      if (isShouldHaltJobExecution(digestResult.digestCreationResult)) {
        return;
      }

      digestAmount = digestResult.digestAmount;
    }

    if (job.type === StepTypeEnum.DELAY) {
      delayAmount = await this.handleDelay(command, filterVariables, delayAmount);

      if (delayAmount === undefined) {
        Logger.warn(`Delay  Amount does not exist on a delay job ${job._id}`, LOG_CONTEXT);

        return;
      }
    }

    if ((digestAmount || delayAmount) && filtered) {
      Logger.verbose(`Delay for job ${job._id} will be 0 because job was filtered`, LOG_CONTEXT);
    }

    const delay = this.getExecutionDelayAmount(filtered, digestAmount, delayAmount);

    await this.queueJob(job, delay);
  }

  private async executeNoneDeferredJob(command: AddJobCommand): Promise<void> {
    const job = command.job;

    Logger.verbose(`Updating status to queued for job ${job._id}`, LOG_CONTEXT);
    await this.jobRepository.updateStatus(command.environmentId, job._id, JobStatusEnum.QUEUED);

    await this.queueJob(job, 0);
  }

  private async handleDelay(
    command: AddJobCommand,
    filterVariables: IFilterVariables,
    delayAmount: number | undefined
  ) {
    command.chimeraResponse = await this.resonateUsecase.execute<
      AddJobCommand & { variables: IFilterVariables },
      ExecuteOutput<IChimeraDigestResponse>
    >({
      ...command,
      variables: filterVariables,
    });
    delayAmount = await this.addDelayJob.execute(command);

    Logger.debug(`Delay step Amount is: ${delayAmount}`, LOG_CONTEXT);

    return delayAmount;
  }

  private async handleDigest(
    command: AddJobCommand,
    filterVariables: IFilterVariables,
    job,
    digestAmount: number | undefined,
    filtered: boolean
  ) {
    const resonateResponse = await this.resonateUsecase.execute<
      AddJobCommand & { variables: IFilterVariables },
      ExecuteOutput<IChimeraDigestResponse>
    >({
      ...command,
      variables: filterVariables,
    });

    validateDigest(job);

    digestAmount = this.calculateDelayService.calculateDelay({
      stepMetadata: job.digest,
      payload: job.payload,
      overrides: job.overrides,
      chimeraResponse: this.fallbackToRegularDigest(resonateResponse?.outputs),
    });

    Logger.debug(`Digest step amount is: ${digestAmount}`, LOG_CONTEXT);

    const digestCreationResult = await this.mergeOrCreateDigestUsecase.execute(
      MergeOrCreateDigestCommand.create({
        job,
        filtered,
        chimeraData: resonateResponse?.outputs,
      })
    );

    if (digestCreationResult === DigestCreationResultEnum.MERGED) {
      this.handleDigestMerged();
    }

    if (digestCreationResult === DigestCreationResultEnum.SKIPPED) {
      await this.handleDigestSkip(command, job);
    }

    return { digestAmount, digestCreationResult };
  }

  private handleDigestMerged() {
    Logger.log('Digest was merged, queueing next job', LOG_CONTEXT);

    return;
  }

  private async handleDigestSkip(command: AddJobCommand, job) {
    const nextJobToSchedule = await this.jobRepository.findOne({
      _environmentId: command.environmentId,
      _parentId: job._id,
    });

    if (!nextJobToSchedule) {
      return;
    }

    await this.execute({
      userId: job._userId,
      environmentId: job._environmentId,
      organizationId: command.organizationId,
      jobId: nextJobToSchedule._id,
      job: nextJobToSchedule,
    });

    return;
  }

  private getExecutionDelayAmount(
    filtered: boolean,
    digestAmount: number | undefined,
    delayAmount: undefined | number
  ) {
    return (filtered ? 0 : digestAmount ?? delayAmount) ?? 0;
  }

  /*
   *  Fallback to regular digest type.
   *  This is a temporary solution until other digest types are implemented.
   */
  private fallbackToRegularDigest(outputs: IChimeraDigestResponse | undefined): IChimeraDigestResponse | undefined {
    let resonateResponseOutput: IChimeraDigestResponse | undefined = undefined;

    if (outputs) {
      const { type, ...resonateResponseOutputsOmitType } = outputs;
      resonateResponseOutput = { type: DigestTypeEnum.REGULAR, ...resonateResponseOutputsOmitType };
    }

    return resonateResponseOutput;
  }

  public async queueJob(job: JobEntity, delay: number) {
    Logger.verbose(`Adding Job ${job._id} to Queue`, LOG_CONTEXT);
    const stepContainsWebhookFilter = this.stepContainsFilter(job, 'webhook');
    const options: JobsOptions = {
      delay,
    };
    if (stepContainsWebhookFilter) {
      options.backoff = {
        type: BackoffStrategiesEnum.WEBHOOK_FILTER_BACKOFF,
      };
      options.attempts = this.standardQueueService.DEFAULT_ATTEMPTS;
    }

    const jobData = {
      _environmentId: job._environmentId,
      _id: job._id,
      _organizationId: job._organizationId,
      _userId: job._userId,
    };

    Logger.verbose(jobData, 'Going to add a minimal job in Standard Queue', LOG_CONTEXT);

    await this.standardQueueService.add({
      name: job._id,
      data: jobData,
      groupId: job._organizationId,
      options: options,
    });

    if (delay) {
      const logMessage =
        job.type === StepTypeEnum.DELAY
          ? 'Delay is active, Creating execution details'
          : job.type === StepTypeEnum.DIGEST
          ? 'Digest is active, Creating execution details'
          : 'Unexpected job type, Creating execution details';

      Logger.verbose(logMessage, LOG_CONTEXT);

      await this.executionLogRoute.execute(
        ExecutionLogRouteCommand.create({
          ...ExecutionLogRouteCommand.getDetailsFromJob(job),
          detail: job.type === StepTypeEnum.DELAY ? DetailEnum.STEP_DELAYED : DetailEnum.STEP_DIGESTED,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.PENDING,
          isTest: false,
          isRetry: false,
          raw: JSON.stringify({ delay }),
        })
      );
    }
  }

  private stepContainsFilter(job: JobEntity, onFilter: string) {
    return job.step.filters?.some((filter) => {
      return filter.children?.some((child) => {
        return child.on === onFilter;
      });
    });
  }
}

function isJobDeferredType(jobType: StepTypeEnum | undefined) {
  if (!jobType) return false;

  return [StepTypeEnum.DELAY, StepTypeEnum.DIGEST].includes(jobType);
}

function isShouldHaltJobExecution(digestCreationResult: DigestCreationResultEnum) {
  return [DigestCreationResultEnum.MERGED, DigestCreationResultEnum.SKIPPED].includes(digestCreationResult);
}
