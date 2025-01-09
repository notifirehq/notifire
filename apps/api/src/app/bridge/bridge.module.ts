import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateChange,
  CreateMessageTemplate,
  CreateWorkflow,
  DeleteMessageTemplate,
  DeleteWorkflowUseCase,
  GetPreferences,
  GetWorkflowByIdsUseCase,
  UpdateChange,
  UpdateMessageTemplate,
  UpdateWorkflow,
  UpsertControlValuesUseCase,
  UpsertPreferences,
  DeletePreferencesUseCase,
  TierRestrictionsValidateUsecase,
} from '@novu/application-generic';
import { CommunityOrganizationRepository, PreferencesRepository } from '@novu/dal';
import { SharedModule } from '../shared/shared.module';
import { BridgeController } from './bridge.controller';
import { USECASES } from './usecases';
import { PostProcessWorkflowUpdate } from '../workflows-v2/usecases/post-process-workflow-update';
import { OverloadContentDataOnWorkflowUseCase } from '../workflows-v2/usecases/overload-content-data';
import {
  BuildDefaultPayloadUsecase,
  CollectPlaceholderWithDefaultsUsecase,
  PrepareAndValidateContentUsecase,
  ValidatePlaceholderUsecase,
} from '../workflows-v2/usecases/validate-content';
import { BuildAvailableVariableSchemaUsecase } from '../workflows-v2/usecases/build-variable-schema';
import { ExtractDefaultValuesFromSchemaUsecase } from '../workflows-v2/usecases/extract-default-values-from-schema';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';
import { BuildSchemasByControlValues } from '../workflows-v2/usecases/build-payload-schema/build-payload-schema.usecase';

const PROVIDERS = [
  CreateWorkflow,
  UpdateWorkflow,
  GetWorkflowByIdsUseCase,
  DeleteWorkflowUseCase,
  UpsertControlValuesUseCase,
  CreateMessageTemplate,
  UpdateMessageTemplate,
  DeleteMessageTemplate,
  CreateChange,
  UpdateChange,
  PreferencesRepository,
  GetPreferences,
  UpsertPreferences,
  DeletePreferencesUseCase,
  UpsertControlValuesUseCase,
  PostProcessWorkflowUpdate,
  OverloadContentDataOnWorkflowUseCase,
  PrepareAndValidateContentUsecase,
  BuildAvailableVariableSchemaUsecase,
  BuildDefaultPayloadUsecase,
  ValidatePlaceholderUsecase,
  CollectPlaceholderWithDefaultsUsecase,
  ExtractDefaultValuesFromSchemaUsecase,
  TierRestrictionsValidateUsecase,
  HydrateEmailSchemaUseCase,
  CommunityOrganizationRepository,
  BuildSchemasByControlValues,
];

@Module({
  imports: [SharedModule],
  providers: [...PROVIDERS, ...USECASES],
  controllers: [BridgeController],
  exports: [...USECASES],
})
export class BridgeModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {}
}
