/* eslint-disable no-param-reassign */
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { StepDataDto, UserSessionData } from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateEntity, NotificationTemplateRepository } from '@novu/dal';
import {
  DeleteControlValuesCommand,
  DeleteControlValuesUseCase,
  GetWorkflowByIdsUseCase,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
} from '@novu/application-generic';
import { PatchStepCommand } from './patch-step.command';
import { BuildStepDataUsecase } from '../build-step-data';

type ValidNotificationWorkflow = {
  currentStep: NonNullable<NotificationStepEntity>;
  workflow: NotificationTemplateEntity;
};
@Injectable()
export class PatchStepUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    @Inject(forwardRef(() => DeleteControlValuesUseCase))
    private deleteControlValuesUseCase: DeleteControlValuesUseCase
  ) {}

  async execute(command: PatchStepCommand): Promise<StepDataDto> {
    const persistedItems = await this.loadPersistedItems(command);
    await this.patchFieldsOnPersistedItems(command, persistedItems);
    await this.persistWorkflow(persistedItems.workflow, command.user);

    return await this.buildStepDataUsecase.execute(command);
  }

  private async patchFieldsOnPersistedItems(command: PatchStepCommand, persistedItems: ValidNotificationWorkflow) {
    if (command.name !== undefined) {
      await this.updateName(persistedItems, command);
    }

    if (command.controlValues !== undefined) {
      if (command.controlValues === null) {
        await this.deleteControlValuesUseCase.execute(
          DeleteControlValuesCommand.create({
            environmentId: command.user.environmentId,
            organizationId: command.user.organizationId,
            stepId: persistedItems.currentStep._id as string,
            workflowId: persistedItems.workflow._id,
            userId: command.user._id,
          })
        );
      } else {
        await this.updateControlValues(persistedItems, command);
      }
    }
  }

  private async loadPersistedItems(command: PatchStepCommand) {
    const workflow = await this.fetchWorkflow(command);

    const { currentStep } = await this.findStepByStepId(command, workflow);

    return { workflow, currentStep };
  }

  private async updateName(persistedItems: ValidNotificationWorkflow, command: PatchStepCommand) {
    persistedItems.currentStep.name = command.name;
  }

  private async persistWorkflow(
    workflowWithIssues: Partial<NotificationTemplateEntity>,
    userSessionData: UserSessionData
  ) {
    await this.notificationTemplateRepository.update(
      {
        _id: workflowWithIssues._id,
        _environmentId: userSessionData.environmentId,
      },
      {
        ...workflowWithIssues,
      }
    );
  }

  private async fetchWorkflow(command: PatchStepCommand) {
    return await this.getWorkflowByIdsUseCase.execute({
      workflowIdOrInternalId: command.workflowIdOrInternalId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      userId: command.user._id,
    });
  }

  private async findStepByStepId(command: PatchStepCommand, workflow: NotificationTemplateEntity) {
    const currentStep = workflow.steps.find(
      (stepItem) => stepItem._id === command.stepIdOrInternalId || stepItem.stepId === command.stepIdOrInternalId
    );

    if (!currentStep) {
      throw new BadRequestException({
        message: 'No step found',
        stepIdOrInternalId: command.stepIdOrInternalId,
        workflowId: command.workflowIdOrInternalId,
      });
    }

    return { currentStep };
  }

  private async updateControlValues(persistedItems: ValidNotificationWorkflow, command: PatchStepCommand) {
    return await this.upsertControlValuesUseCase.execute(
      UpsertControlValuesCommand.create({
        organizationId: command.user.organizationId,
        environmentId: command.user.environmentId,
        notificationStepEntity: persistedItems.currentStep,
        workflowId: persistedItems.workflow._id,
        newControlValues: command.controlValues || {},
      })
    );
  }
}
