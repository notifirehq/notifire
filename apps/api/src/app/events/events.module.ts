import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import {
  AddDelayJob,
  AddDigestJob,
  AddJob,
  BullMqService,
  CreateNotificationJobs,
  DigestFilterSteps,
  DigestFilterStepsBackoff,
  DigestFilterStepsRegular,
  DigestFilterStepsTimed,
  EventsDistributedLockService,
  GetNovuProviderCredentials,
  ProcessSubscriber,
  QueuesModule,
  StorageHelperService,
  SendTestEmail,
  StoreSubscriberJobs,
  TriggerEvent,
} from '@novu/application-generic';

import { EventsController } from './events.controller';
import { EventsWorkflowQueueService } from './services';
import { USE_CASES } from './usecases';

import { SharedModule } from '../shared/shared.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { AuthModule } from '../auth/auth.module';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { LogsModule } from '../logs/logs.module';
import { ContentTemplatesModule } from '../content-templates/content-templates.module';
import { IntegrationModule } from '../integrations/integrations.module';
import { ExecutionDetailsModule } from '../execution-details/execution-details.module';
import { TopicsModule } from '../topics/topics.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { TenantModule } from '../tenant/tenant.module';

const PROVIDERS = [
  AddDelayJob,
  AddDigestJob,
  AddJob,
  BullMqService,
  CreateNotificationJobs,
  DigestFilterSteps,
  DigestFilterStepsBackoff,
  DigestFilterStepsRegular,
  DigestFilterStepsTimed,
  EventsWorkflowQueueService,
  GetNovuProviderCredentials,
  StorageHelperService,
  EventsDistributedLockService,
  ProcessSubscriber,
  SendTestEmail,
  StoreSubscriberJobs,
  TriggerEvent,
];

@Module({
  imports: [
    SharedModule,
    TerminusModule,
    WidgetsModule,
    AuthModule,
    SubscribersModule,
    LogsModule,
    ContentTemplatesModule,
    IntegrationModule,
    ExecutionDetailsModule,
    TopicsModule,
    LayoutsModule,
    TenantModule,
    QueuesModule,
  ],
  controllers: [EventsController],
  providers: [...PROVIDERS, ...USE_CASES],
})
export class EventsModule {}
