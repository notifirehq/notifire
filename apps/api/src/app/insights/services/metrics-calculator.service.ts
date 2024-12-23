import { Injectable, Logger } from '@nestjs/common';
import { startOfDay, formatISO } from 'date-fns';
import { ChannelTypeEnum } from '@novu/shared';
import {
  IDateRange,
  IMixpanelInboxResponse,
  IInboxMetrics,
  IOrganizationMetrics,
  IMixpanelTriggerResponse,
  IMetricStats,
  IChannelData,
  MixpanelInboxSeriesNameEnum,
} from '../types/usage-insights.types';

@Injectable()
export class MetricsCalculatorService {
  private roundToStartOfDay(date: string): string {
    return formatISO(startOfDay(new Date(date)));
  }

  calculateChange(current: number, previous: number): number {
    let change: number;

    if (previous === 0) {
      change = current > 0 ? 100 : 0;
    } else {
      change = Number(((current - previous) / previous) * 100);
    }

    Logger.debug(`Calculating change: current=${current}, previous=${previous}, change=${change}%`);

    return change;
  }

  getSeriesDateRange(currentSeries: IChannelData, previousSeries: IChannelData): IDateRange {
    const currentDates = Object.keys(currentSeries?.$overall || {});
    const previousDates = Object.keys(previousSeries?.$overall || {});

    if (!currentDates.length || !previousDates.length) {
      return { from_date: '', to_date: '' };
    }

    return {
      from_date: this.roundToStartOfDay(previousDates[0]),
      to_date: this.roundToStartOfDay(currentDates[0]),
    };
  }

  calculateInboxMetrics(
    inboxSeries?: Record<MixpanelInboxSeriesNameEnum, IChannelData>,
    inboxTimeComparison?: Record<MixpanelInboxSeriesNameEnum, IChannelData>,
    orgId?: string,
    dateRange?: IDateRange
  ): IInboxMetrics {
    const emptyResponse = { current: 0, previous: 0, change: 0 };

    if (!inboxSeries || !inboxTimeComparison || !orgId || !dateRange) {
      return {
        sessionInitialized: emptyResponse,
        updatePreferences: emptyResponse,
        markNotification: emptyResponse,
        updateAction: emptyResponse,
      };
    }

    Logger.debug(`Calculating inbox metrics for organization`);
    const getMetricStats = (
      currentSeriesData: IChannelData | undefined,
      previousSeriesData: IChannelData | undefined
    ): IMetricStats => {
      if (!currentSeriesData || !previousSeriesData) {
        Logger.debug(`No series data available for ${orgId}`);

        return emptyResponse;
      }

      const currentOrgData = currentSeriesData[orgId];
      const previousOrgData = previousSeriesData[orgId];

      if (!currentOrgData || !previousOrgData) {
        Logger.debug(`No series data available for ${orgId}`);

        return emptyResponse;
      }

      const currentData = currentOrgData[this.roundToStartOfDay(dateRange.to_date)];
      const previousData = previousOrgData[this.roundToStartOfDay(dateRange.from_date)];

      if (!currentData || !previousData) {
        Logger.debug(`No data available for ${orgId}`);

        return emptyResponse;
      }

      const current = Number(currentData || 0);
      const previous = Number(previousData || 0);
      const change = this.calculateChange(current, previous);

      Logger.debug(`Metric stats for ${orgId}: current=${current}, previous=${previous}, change=${change}%`);

      return { current, previous, change };
    };

    return {
      sessionInitialized: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]
      ),
      updatePreferences: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]
      ),
      markNotification: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]
      ),
      updateAction: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]
      ),
    };
  }

  calculateOverallInboxMetrics(
    orgId: string,
    inboxSeries: IMixpanelInboxResponse['series'],
    inboxTimeComparison: IMixpanelInboxResponse['time_comparison']['series']
  ): IInboxMetrics {
    Logger.debug('Calculating overall inbox metrics');

    const getMetricStats = (
      currentSeriesData: IChannelData | undefined,
      previousSeriesData: IChannelData | undefined
    ): IMetricStats => {
      if (!currentSeriesData?.$overall || !previousSeriesData?.$overall) {
        return { current: 0, previous: 0, change: 0 };
      }

      const current = Number(Object.values(currentSeriesData.$overall)[0] || 0);
      const previous = Number(Object.values(previousSeriesData.$overall)[0] || 0);
      const change = this.calculateChange(current, previous);

      return { current, previous, change };
    };

    return {
      sessionInitialized: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED][orgId],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED][orgId]
      ),
      updatePreferences: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES][orgId],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES][orgId]
      ),
      markNotification: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION][orgId],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION][orgId]
      ),
      updateAction: getMetricStats(
        inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION][orgId],
        inboxTimeComparison[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION][orgId]
      ),
    };
  }

  calculateEventTriggersMetrics(
    subscriberSeries: IChannelData,
    subscriberTimeComparison: IChannelData
  ): IOrganizationMetrics['eventTriggers'] {
    const current = Number(Object.values(subscriberSeries?.$overall || {})[0] || 0);
    const previous = Number(Object.values(subscriberTimeComparison?.$overall || {})[0] || 0);
    const change = this.calculateChange(current, previous);

    return { current, previous, change };
  }

  calculateChannelBreakdown(
    workflowSeries: IChannelData,
    workflowTimeComparison: IChannelData
  ): IOrganizationMetrics['channelBreakdown'] {
    const channelBreakdown: IOrganizationMetrics['channelBreakdown'] = {
      [ChannelTypeEnum.EMAIL]: { current: 0, previous: 0, change: 0 },
      [ChannelTypeEnum.SMS]: { current: 0, previous: 0, change: 0 },
      [ChannelTypeEnum.PUSH]: { current: 0, previous: 0, change: 0 },
      [ChannelTypeEnum.IN_APP]: { current: 0, previous: 0, change: 0 },
      [ChannelTypeEnum.CHAT]: { current: 0, previous: 0, change: 0 },
    };

    const orgWorkflowData = workflowSeries;
    const orgWorkflowPreviousData = workflowTimeComparison;

    if (orgWorkflowData && orgWorkflowPreviousData) {
      Object.entries(orgWorkflowData).forEach(([channel, data]) => {
        if (channel !== '$overall') {
          const currentChannelData = Number(Object.values(data.$overall || {})[0] || 0);
          const previousChannelData = Number(Object.values(orgWorkflowPreviousData[channel]?.$overall || {})[0] || 0);
          const currentChannelChange = this.calculateChange(currentChannelData, previousChannelData);

          channelBreakdown[channel] = {
            current: currentChannelData,
            previous: previousChannelData,
            change: currentChannelChange,
          };
        }
      });
    } else {
      Logger.debug(`No workflow data available for organization`);
    }

    return channelBreakdown;
  }

  calculateWorkflowStats(
    triggerEventSeries: IChannelData,
    previousTriggerEventSeries: IChannelData
  ): IMixpanelTriggerResponse['workflowStats']['workflows'] {
    Logger.debug('Calculating workflow statistics');
    const workflowStats: IMixpanelTriggerResponse['workflowStats']['workflows'] = {};

    const currentWorkflowsData = triggerEventSeries.undefined;
    const previousWorkflowsData = previousTriggerEventSeries.undefined;
    if (!currentWorkflowsData || !previousWorkflowsData) {
      Logger.debug(`No workflow data found for organization`);

      return workflowStats;
    }

    Object.entries(currentWorkflowsData)
      .filter(([name]) => name !== '$overall')
      .forEach(([name, data]) => {
        const current = Number(Object.values(data)[0] || 0);
        const previous = Number(Object.values(previousWorkflowsData[name] || {})[0] || 0);
        const change = this.calculateChange(current, previous);

        workflowStats[name] = { current, previous, change };
        Logger.debug(`Workflow stats for ${name}: current=${current}, previous=${previous}, change=${change}%`);
      });

    return workflowStats;
  }
}
