import { ChannelTypeEnum } from '@novu/shared';

export interface ITableIntegration {
  integrationId: string;
  name: string;
  identifier: string;
  provider: string;
  channel: ChannelTypeEnum;
  environment: string;
  active: boolean;
  conditions?: string[];
  primary?: boolean;
  isPrimary?: boolean;
}
