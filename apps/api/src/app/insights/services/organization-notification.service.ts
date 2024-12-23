import { Injectable, Logger } from '@nestjs/common';
import { CommunityOrganizationRepository } from '@novu/dal';
import { FeatureFlagsService } from '@novu/application-generic';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { usageInsightsWorkflow } from '@novu/notifications';
import { IDateRange, IOrganizationMetrics } from '../types/usage-insights.types';

@Injectable()
export class OrganizationNotificationService {
  constructor(
    private organizationRepository: CommunityOrganizationRepository,
    private featureFlagsService: FeatureFlagsService
  ) {}

  async sendOrganizationNotification(organizationId: string, metrics: IOrganizationMetrics, dateRange: IDateRange) {
    Logger.debug(`Processing metrics for organization: ${organizationId}`);
    try {
      const organization = await this.organizationRepository.findById(organizationId);

      if (!organization) {
        Logger.warn(`Organization not found in repository: ${organizationId}`);

        return;
      }

      Logger.debug(`Enriched metrics for ${organization.name}:`, metrics);

      const isEnabled = await this.featureFlagsService.get(FeatureFlagsKeysEnum.IS_USAGE_INSIGHTS_ENABLED, false, {
        environmentId: 'system',
        organizationId: organization._id,
        userId: 'system',
      });

      if (!isEnabled) {
        Logger.log('Skipping notification delivery - usage insights disabled by feature flag', metrics);

        return;
      }

      const payload = {
        organizationName: organization.name,
        period: {
          current: dateRange.to_date,
          previous: dateRange.from_date,
        },
        subscriberNotifications: metrics.eventTriggers,
        channelBreakdown: metrics.channelBreakdown,
        inboxMetrics: metrics.inboxMetrics,
        workflowStats: metrics.workflowStats,
      };

      Logger.debug(`Sending notification for ${organization.name} with payload:`, payload);

      await usageInsightsWorkflow.trigger({
        to: {
          subscriberId: '675fe9bcab6a05bb6dcb7dab_11',
          email: `dima+testing-${organization._id}@novu.co`,
        },
        payload,
        secretKey: process.env.NOVU_INTERNAL_SECRET_KEY,
      });
    } catch (error) {
      Logger.error(`Failed to process metrics for organization ${organizationId}:`, error);
    }
  }
}
