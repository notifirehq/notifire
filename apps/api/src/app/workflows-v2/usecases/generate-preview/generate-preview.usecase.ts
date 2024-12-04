import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  PreviewPayload,
  StepDataDto,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
  Instrument,
  InstrumentUsecase,
} from '@novu/application-generic';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { createMockPayloadFromSchema } from '../../util/utils';
import { PrepareAndValidateContentUsecase } from '../validate-content/prepare-and-validate-content/prepare-and-validate-content.usecase';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    const { previewPayload: commandVariablesExample, controlValues: commandControlValues } =
      command.generatePreviewRequestDto;
    const stepData = await this.getStepData(command);
    const workflow = await this.findWorkflow(command);
    const preparedAndValidatedContent = await this.prepareAndValidateContentUsecase.execute({
      user: command.user,
      previewPayloadFromDto: commandVariablesExample,
      controlValues: commandControlValues || stepData.controls.values || {},
      controlDataSchema: stepData.controls.dataSchema || {},
      variableSchema: stepData.variables,
    });
    const variablesExample = this.buildVariablesExample(
      workflow,
      preparedAndValidatedContent.finalPayload,
      commandVariablesExample
    );

    const executeOutput = await this.executePreviewUsecase(
      command,
      stepData,
      variablesExample,
      preparedAndValidatedContent.finalControlValues
    );

    return {
      result: {
        preview: executeOutput.outputs as any,
        type: stepData.type as unknown as ChannelTypeEnum,
      },
      previewPayloadExample: variablesExample,
    };
  }

  @Instrument()
  private buildVariablesExample(
    workflow: WorkflowInternalResponseDto,
    finalPayload?: PreviewPayload,
    commandVariablesExample?: PreviewPayload | undefined
  ) {
    if (workflow.origin !== WorkflowOriginEnum.EXTERNAL) {
      return finalPayload;
    }

    const examplePayloadSchema = createMockPayloadFromSchema(workflow.payloadSchema);

    if (!examplePayloadSchema || Object.keys(examplePayloadSchema).length === 0) {
      return finalPayload;
    }

    return _.merge(
      finalPayload as Record<string, unknown>,
      { payload: examplePayloadSchema },
      commandVariablesExample || {}
    );
  }

  @Instrument()
  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        identifierOrInternalId: command.identifierOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  @Instrument()
  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      stepId: command.stepDatabaseId,
      user: command.user,
    });
  }

  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }

  @Instrument()
  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    updatedControlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);
    try {
      return await this.legacyPreviewStepUseCase.execute(
        PreviewStepCommand.create({
          payload: hydratedPayload.payload || {},
          subscriber: hydratedPayload.subscriber,
          controls: updatedControlValues || {},
          environmentId: command.user.environmentId,
          organizationId: command.user.organizationId,
          stepId: stepData.stepId,
          userId: command.user._id,
          workflowId: stepData.workflowId,
          workflowOrigin: stepData.origin,
          state,
        })
      );
    } catch (error) {
      if (this.isFrameworkError(error)) {
        throw new GeneratePreviewError(error);
      } else {
        throw error;
      }
    }
  }
}

function buildState(steps: Record<string, unknown> | undefined): FrameworkPreviousStepsOutputState[] {
  const outputArray: FrameworkPreviousStepsOutputState[] = [];
  for (const [stepId, value] of Object.entries(steps || {})) {
    outputArray.push({
      stepId,
      outputs: value as Record<string, unknown>,
      state: {
        status: JobStatusEnum.COMPLETED,
      },
    });
  }

  return outputArray;
}

export class GeneratePreviewError extends InternalServerErrorException {
  constructor(error: FrameworkError) {
    super({
      message: `GeneratePreviewError: Original Message:`,
      frameworkMessage: error.response.message,
      code: error.response.code,
      data: error.response.data,
    });
  }
}

class FrameworkError {
  response: {
    message: string;
    code: string;
    data: unknown;
  };
  status: number;
  options: Record<string, unknown>;
  message: string;
  name: string;
}
