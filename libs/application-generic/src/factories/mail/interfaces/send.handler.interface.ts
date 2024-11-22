import {
  type IEmailOptions,
  type ChannelTypeEnum,
  type ICredentials,
} from '@novu/shared';
import {
  type IEmailProvider,
  type ISendMessageSuccessResponse,
  type ICheckIntegrationResponse,
} from '@novu/stateless';

export interface IMailHandler {
  canHandle(providerId: string, channelType: ChannelTypeEnum);

  buildProvider(credentials: ICredentials, from?: string);

  send(mailData: IEmailOptions): Promise<ISendMessageSuccessResponse>;

  getProvider(): IEmailProvider;

  check(): Promise<ICheckIntegrationResponse>;
}
