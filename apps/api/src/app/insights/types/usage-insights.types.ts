import { ChannelTypeEnum } from '@novu/shared';

export enum MixpanelTriggerEventNameEnum {
  NOTIFICATION_SUBSCRIBER_EVENT = 'A. Notification Subscriber Event Trigger [Total Events]',
  PROCESS_WORKFLOW_STEP = 'B. Process Workflow Step - [Triggers] [Total Events]',
}

export enum MixpanelInboxSeriesNameEnum {
  INBOX_SESSION_INITIALIZED = 'A. Session Initialized - [Inbox] [Total Events]',
  INBOX_UPDATE_PREFERENCES = 'B. Update Preferences - [Inbox] [Total Events]',
  INBOX_MARK_NOTIFICATION = 'C. Mark Notification As - [Inbox] [Total Events]',
  INBOX_UPDATE_ACTION = 'D. Update Notification Action - [Inbox] [Total Events]',
}

export interface IDateRange {
  from_date: string;
  to_date: string;
}

export interface IChannelMetrics {
  current: number;
  previous: number;
  change: number;
}

export interface IOrganizationMetrics {
  eventTriggers: IChannelMetrics;
  channelBreakdown: {
    [channel in ChannelTypeEnum]: IChannelMetrics;
  };
  workflowStats: {
    [workflow: string]: IChannelMetrics;
  };
  inboxMetrics: IInboxMetrics;
}

export interface IMetricData {
  [date: string]: number;
}

export interface IChannelData {
  [channel: string]: IMetricData;
  $overall: IMetricData;
}

export type ISeriesData = {
  [organizationId: string]: IChannelData;
} & {
  $overall: IMetricData;
};

export interface IMixpanelTriggerResponse {
  series: {
    [MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]: ISeriesData;
    [MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP]: ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      [MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]: ISeriesData;
      [MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP]: ISeriesData;
    };
  };
  workflowStats: {
    workflows: {
      [name: string]: {
        current: number;
        previous: number;
        change: number;
      };
    };
  };
}

export interface IMixpanelInboxResponse {
  series: {
    [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: ISeriesData;
    [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: ISeriesData;
    [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: ISeriesData;
    [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: ISeriesData;
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: ISeriesData;
      [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: ISeriesData;
      [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: ISeriesData;
    };
  };
}

export interface IMetricStats {
  current: number;
  previous: number;
  change: number;
}

export interface IInboxMetrics {
  sessionInitialized: IMetricStats;
  updatePreferences: IMetricStats;
  markNotification: IMetricStats;
  updateAction: IMetricStats;
}

export interface IUsageInsightsResponse {
  series: IMixpanelTriggerResponse['series'];
  workflowStats: IMixpanelTriggerResponse['workflowStats'];
  inboxStats: {
    byOrganization: {
      [organizationId: string]: IInboxMetrics;
    };
    overall: IInboxMetrics;
  };
}
