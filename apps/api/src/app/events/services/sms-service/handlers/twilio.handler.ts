import { TwilioSmsProvider, TwilioConfig } from '@novu/twilio';
import { ChannelTypeEnum } from '@novu/shared';
import { ICredentials } from '@novu/dal';
import { BaseSmsHandler } from './base.handler';

export class TwilioHandler extends BaseSmsHandler {
  constructor() {
    super('twilio', ChannelTypeEnum.SMS);
  }
  buildProvider(credentials: ICredentials) {
    const config: TwilioConfig = {
      accountSid: credentials.accountSid,
      authToken: credentials.token,
      from: credentials.from,
    };

    this.provider = new TwilioSmsProvider(config);
  }
}
