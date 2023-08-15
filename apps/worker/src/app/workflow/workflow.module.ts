import { Module } from '@nestjs/common';
import {
  AddDelayJob,
  AddDigestJob,
  bullMqService,
  BulkCreateExecutionDetails,
  CalculateLimitNovuIntegration,
  CompileEmailTemplate,
  CompileTemplate,
  GetDecryptedIntegrations,
  GetLayoutUseCase,
  GetNovuLayout,
  GetNovuProviderCredentials,
  GetSubscriberPreference,
  GetSubscriberTemplatePreference,
  QueuesModule,
  SelectIntegration,
  SendTestEmail,
  SendTestEmailCommand,
  StandardQueueService,
  WorkflowQueueService,
  WebSocketsWorkerService,
  WebSocketsQueueService,
} from '@novu/application-generic';
import { JobRepository, MessageRepository, OrganizationRepository, SubscriberRepository } from '@novu/dal';

import { JobMetricService, StandardWorker, WorkflowWorker } from './services';
import {
  MessageMatcher,
  SendMessage,
  SendMessageChat,
  SendMessageDelay,
  SendMessageEmail,
  SendMessageInApp,
  SendMessagePush,
  SendMessageSms,
  Digest,
  GetDigestEventsBackoff,
  GetDigestEventsRegular,
  HandleLastFailedJob,
  QueueNextJob,
  RunJob,
  SetJobAsCompleted,
  SetJobAsFailed,
  UpdateJobStatus,
  WebhookFilterBackoffStrategy,
} from './usecases';

import { CreateLog } from '../shared/logs';
import { SharedModule } from '../shared/shared.module';

const REPOSITORIES = [JobRepository];

const USE_CASES = [
  AddDelayJob,
  AddDigestJob,
  CalculateLimitNovuIntegration,
  GetDecryptedIntegrations,
  SelectIntegration,
  GetSubscriberPreference,
  GetSubscriberTemplatePreference,
  HandleLastFailedJob,
  MessageMatcher,
  QueueNextJob,
  RunJob,
  SendMessage,
  SendMessageChat,
  SendMessageDelay,
  SendMessageEmail,
  SendMessageInApp,
  SendMessagePush,
  SendMessageSms,
  SendTestEmail,
  SendTestEmailCommand,
  CompileEmailTemplate,
  CompileTemplate,
  Digest,
  GetDigestEventsBackoff,
  GetDigestEventsRegular,
  GetLayoutUseCase,
  GetNovuLayout,
  GetNovuProviderCredentials,
  SetJobAsCompleted,
  SetJobAsFailed,
  UpdateJobStatus,
  WebhookFilterBackoffStrategy,
];

const bullMqTokenList = {
  provide: 'BULLMQ_LIST',
  useFactory: (
    standardQueueService: WorkflowQueueService,
    webSocketsQueueService: WebSocketsQueueService,
    workflowQueueService: WorkflowQueueService
  ) => {
    return [standardQueueService, webSocketsQueueService, workflowQueueService];
  },
  inject: [StandardQueueService, WebSocketsQueueService, WorkflowQueueService],
};

const PROVIDERS = [bullMqService, bullMqTokenList, StandardWorker, WorkflowWorker];

@Module({
  imports: [SharedModule, QueuesModule],
  controllers: [],
  providers: [...PROVIDERS, ...USE_CASES, ...REPOSITORIES],
})
export class WorkflowModule {}
