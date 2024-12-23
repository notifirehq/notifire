import { Module } from '@nestjs/common';
import {
  OrganizationRepository,
  MessageRepository,
  NotificationRepository,
  CommunityOrganizationRepository,
} from '@novu/dal';
import { USE_CASES } from './usecases';
import { SharedModule } from '../shared/shared.module';
import { InsightsInitializerService } from './services/insights-initializer.service';
import { MixpanelService } from './services/mixpanel.service';
import { MetricsCalculatorService } from './services/metrics-calculator.service';
import { OrganizationNotificationService } from './services/organization-notification.service';
import { InsightsController } from './insights.controller';

@Module({
  imports: [SharedModule],
  providers: [
    ...USE_CASES,
    InsightsInitializerService,
    OrganizationRepository,
    MessageRepository,
    NotificationRepository,
    CommunityOrganizationRepository,
    MixpanelService,
    MetricsCalculatorService,
    OrganizationNotificationService,
  ],
  controllers: [InsightsController],
  exports: [...USE_CASES],
})
export class InsightsModule {}
