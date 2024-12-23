import { Injectable, Logger } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';

import {
  IChannelData,
  IMixpanelInboxResponse,
  IMixpanelTriggerResponse,
  IOrganizationMetrics,
  MixpanelInboxSeriesNameEnum,
  MixpanelTriggerEventNameEnum,
  ISeriesData,
} from '../../types/usage-insights.types';
import { MixpanelService } from '../../services/mixpanel.service';
import { MetricsCalculatorService } from '../../services/metrics-calculator.service';
import { OrganizationNotificationService } from '../../services/organization-notification.service';
import { UsageInsightsCommand } from './usage-insights.command';

interface IOrganizationData {
  workflowTrigger: {
    current: IChannelData;
    previous: IChannelData;
  };
  stepProcessing: {
    current: IChannelData;
    previous: IChannelData;
  };
  inbox?: {
    current: Record<MixpanelInboxSeriesNameEnum, IChannelData>;
    previous: Record<MixpanelInboxSeriesNameEnum, IChannelData>;
  };
}

interface IProcessedSeriesData {
  triggerEvents: {
    current: ISeriesData;
    previous: ISeriesData;
  };
  workflowSteps: {
    current: ISeriesData;
    previous: ISeriesData;
  };
}

interface IProcessedInboxData {
  current: Record<MixpanelInboxSeriesNameEnum, ISeriesData>;
  previous: Record<MixpanelInboxSeriesNameEnum, ISeriesData>;
}

@Injectable()
export class UsageInsights {
  constructor(
    private mixpanelService: MixpanelService,
    private metricsCalculator: MetricsCalculatorService,
    private organizationNotification: OrganizationNotificationService
  ) {
    Logger.debug('UsageInsights service initialized');
  }

  @InstrumentUsecase()
  async execute(command: UsageInsightsCommand): Promise<void> {
    Logger.debug('Executing UsageInsights usecase', { command });

    const [mixpanelData, inboxData] = await Promise.all([
      this.mixpanelService.fetchMixpanelInsights(),
      this.mixpanelService.fetchInboxInsights(),
    ]);

    if (!mixpanelData?.series || !inboxData?.series) {
      Logger.error('Mixpanel data unavailable or invalid');

      return;
    }

    Logger.debug('Processing organization data');

    if (command.organizationId) {
      await this.processOrganization(command.organizationId, mixpanelData, inboxData);
    } else {
      let counter = 0;
      for (const [orgId, orgData] of Object.entries(
        mixpanelData.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]
      )) {
        if (orgId === '$overall') continue;

        counter += 1;
        if (counter > 5) break;

        await this.processOrganization(orgId, mixpanelData, inboxData);
      }
    }

    Logger.debug('Usage Insights execution completed successfully');
  }

  private processSeriesData(mixpanelData: IMixpanelTriggerResponse): IProcessedSeriesData {
    return {
      triggerEvents: {
        current: mixpanelData.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT],
        previous: mixpanelData.time_comparison.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT],
      },
      workflowSteps: {
        current: mixpanelData.series[MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP],
        previous: mixpanelData.time_comparison.series[MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP],
      },
    };
  }

  private getOrganizationInboxData(inboxData: IMixpanelInboxResponse, orgId: string) {
    const currentInboxData: Record<MixpanelInboxSeriesNameEnum, IChannelData> = {
      [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: inboxData.series[
        MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: inboxData.series[
        MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: inboxData.series[
        MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: inboxData.series[
        MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION
      ][orgId] as IChannelData,
    };

    const previousInboxData: Record<MixpanelInboxSeriesNameEnum, IChannelData> = {
      [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: inboxData.time_comparison.series[
        MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: inboxData.time_comparison.series[
        MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: inboxData.time_comparison.series[
        MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION
      ][orgId] as IChannelData,
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: inboxData.time_comparison.series[
        MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION
      ][orgId] as IChannelData,
    };

    return {
      current: currentInboxData,
      previous: previousInboxData,
    };
  }

  private async processOrganization(
    orgId: string,
    mixpanelData: IMixpanelTriggerResponse,
    inboxData: IMixpanelInboxResponse
  ) {
    Logger.debug('Processing Mixpanel and Inbox data');

    // Process series data for triggers and workflows
    const seriesData = this.processSeriesData(mixpanelData);

    if (
      !seriesData.triggerEvents.current ||
      !seriesData.workflowSteps.current ||
      !seriesData.triggerEvents.previous ||
      !seriesData.workflowSteps.previous
    ) {
      Logger.error('Required series data missing from Mixpanel response');

      return;
    }

    // Construct organization data for metrics calculation
    const organizationData: IOrganizationData = {
      workflowTrigger: {
        current: seriesData.triggerEvents.current[orgId] as IChannelData,
        previous: seriesData.triggerEvents.previous[orgId] as IChannelData,
      },
      stepProcessing: {
        current: seriesData.workflowSteps.current[orgId] as IChannelData,
        previous: seriesData.workflowSteps.previous[orgId] as IChannelData,
      },
      inbox: this.getOrganizationInboxData(inboxData, orgId),
    };

    const dateRange = this.metricsCalculator.getSeriesDateRange(
      organizationData.workflowTrigger.current,
      organizationData.workflowTrigger.previous
    );

    // Calculate final metrics
    const metrics: IOrganizationMetrics = {
      eventTriggers: this.metricsCalculator.calculateEventTriggersMetrics(
        organizationData.workflowTrigger.current,
        organizationData.workflowTrigger.previous
      ),
      channelBreakdown: this.metricsCalculator.calculateChannelBreakdown(
        organizationData.stepProcessing.current,
        organizationData.stepProcessing.previous
      ),
      workflowStats: this.metricsCalculator.calculateWorkflowStats(
        organizationData.workflowTrigger.current,
        organizationData.workflowTrigger.previous
      ),
      inboxMetrics: this.metricsCalculator.calculateInboxMetrics(
        organizationData.inbox?.current,
        organizationData.inbox?.previous,
        orgId,
        dateRange
      ),
    };

    await this.organizationNotification.sendOrganizationNotification(orgId, metrics, dateRange);
  }
}
