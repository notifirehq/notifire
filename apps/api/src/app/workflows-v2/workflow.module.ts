import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateWorkflow,
  DeletePreferencesUseCase,
  DeleteWorkflowUseCase,
  GetPreferences,
  GetWorkflowByIdsUseCase,
  UpdateWorkflow,
  UpsertControlValuesUseCase,
  UpsertPreferences,
  TierRestrictionsValidateUsecase,
} from '@novu/application-generic';

import { CommunityOrganizationRepository } from '@novu/dal';
import { SharedModule } from '../shared/shared.module';
import { MessageTemplateModule } from '../message-template/message-template.module';
import { ChangeModule } from '../change/change.module';
import { AuthModule } from '../auth/auth.module';
import { IntegrationModule } from '../integrations/integrations.module';
import { WorkflowController } from './workflow.controller';
import {
  BuildAvailableVariableSchemaUsecase,
  BuildDefaultPayloadUsecase,
  BuildStepDataUsecase,
  BuildWorkflowTestDataUseCase,
  CollectPlaceholderWithDefaultsUsecase,
  ExtractDefaultValuesFromSchemaUsecase,
  GeneratePreviewUsecase,
  GetWorkflowUseCase,
  ListWorkflowsUseCase,
  PostProcessWorkflowUpdate,
  PrepareAndValidateContentUsecase,
  SyncToEnvironmentUseCase,
  UpsertWorkflowUseCase,
  ValidatePlaceholderUsecase,
} from './usecases';
import { BridgeModule } from '../bridge';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers';
import { OverloadContentDataOnWorkflowUseCase } from './usecases/overload-content-data';
import { PatchWorkflowUsecase } from './usecases/patch-workflow';
import { PatchStepUsecase } from './usecases/patch-step-data/patch-step.usecase';
import { BuildSchemasByControlValues } from './usecases/build-payload-schema/build-payload-schema.usecase';

const DAL_REPOSITORIES = [CommunityOrganizationRepository];

@Module({
  imports: [SharedModule, MessageTemplateModule, ChangeModule, AuthModule, BridgeModule, IntegrationModule],
  controllers: [WorkflowController],
  providers: [
    ...DAL_REPOSITORIES,
    CreateWorkflow,
    UpdateWorkflow,
    UpsertWorkflowUseCase,
    ListWorkflowsUseCase,
    DeleteWorkflowUseCase,
    UpsertPreferences,
    DeletePreferencesUseCase,
    UpsertControlValuesUseCase,
    GetPreferences,
    GetWorkflowByIdsUseCase,
    SyncToEnvironmentUseCase,
    BuildStepDataUsecase,
    GeneratePreviewUsecase,
    BuildWorkflowTestDataUseCase,
    GetWorkflowUseCase,
    HydrateEmailSchemaUseCase,
    PostProcessWorkflowUpdate,
    BuildDefaultPayloadUsecase,
    BuildAvailableVariableSchemaUsecase,
    CollectPlaceholderWithDefaultsUsecase,
    PrepareAndValidateContentUsecase,
    ValidatePlaceholderUsecase,
    ExtractDefaultValuesFromSchemaUsecase,
    PatchStepUsecase,
    PostProcessWorkflowUpdate,
    OverloadContentDataOnWorkflowUseCase,
    PatchWorkflowUsecase,
    TierRestrictionsValidateUsecase,
    BuildSchemasByControlValues,
  ],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
