import { IProviderConfig } from '../provider.interface';
import {
  gupshupConfig,
  nexmoConfig,
  plivoConfig,
  sms77Config,
  snsConfig,
  telnyxConfig,
  twilioConfig,
  firetextConfig,
  infobipSMSConfig,
  burstSmsConfig,
  clickatellConfig,
<<<<<<< HEAD
  bulksmsConfig,
=======
  fortySixElksConfig,
  kannelConfig,
>>>>>>> main
} from '../credentials';
import { SmsProviderIdEnum } from '../provider.enum';

import { ChannelTypeEnum } from '../../../types';

export const smsProviders: IProviderConfig[] = [
  {
    id: SmsProviderIdEnum.Nexmo,
    displayName: 'Nexmo',
    channel: ChannelTypeEnum.SMS,
    credentials: nexmoConfig,
    docReference: 'https://developer.nexmo.com/api/sms?theme=dark',
    logoFileName: { light: 'nexmo.png', dark: 'nexmo.png' },
  },
  {
    id: SmsProviderIdEnum.Plivo,
    displayName: 'Plivo',
    channel: ChannelTypeEnum.SMS,
    credentials: plivoConfig,
    docReference: 'https://www.plivo.com/docs/',
    logoFileName: { light: 'plivo.png', dark: 'plivo.png' },
  },

  {
    id: SmsProviderIdEnum.Sms77,
    displayName: 'sms77',
    channel: ChannelTypeEnum.SMS,
    credentials: sms77Config,
    docReference: 'https://www.sms77.io/de/docs/gateway/http-api/',
    logoFileName: { light: 'sms77.svg', dark: 'sms77.svg' },
  },
  {
    id: SmsProviderIdEnum.SNS,
    displayName: 'SNS',
    channel: ChannelTypeEnum.SMS,
    credentials: snsConfig,
    docReference: 'https://docs.aws.amazon.com/sns/index.html',
    logoFileName: { light: 'sns.svg', dark: 'sns.svg' },
  },
  {
    id: SmsProviderIdEnum.Telnyx,
    displayName: 'Telnyx',
    channel: ChannelTypeEnum.SMS,
    credentials: telnyxConfig,
    docReference: 'https://developers.telnyx.com/',
    logoFileName: { light: 'telnyx.png', dark: 'telnyx.png' },
  },
  {
    id: SmsProviderIdEnum.Twilio,
    displayName: 'Twilio',
    channel: ChannelTypeEnum.SMS,
    credentials: twilioConfig,
    docReference: 'https://www.twilio.com/docs',
    logoFileName: { light: 'twilio.png', dark: 'twilio.png' },
  },
  {
    id: SmsProviderIdEnum.Gupshup,
    displayName: 'Gupshup',
    channel: ChannelTypeEnum.SMS,
    credentials: gupshupConfig,
    docReference: 'https://docs.gupshup.io/docs/send-single-message',
    logoFileName: { light: 'gupshup.png', dark: 'gupshup.png' },
  },
  {
    id: SmsProviderIdEnum.Firetext,
    displayName: 'Firetext',
    channel: ChannelTypeEnum.SMS,
    credentials: firetextConfig,
    docReference: 'https://www.firetext.co.uk/docs',
    logoFileName: { light: 'firetext.svg', dark: 'firetext.svg' },
  },
  {
    id: SmsProviderIdEnum.Infobip,
    displayName: 'Infobip',
    channel: ChannelTypeEnum.SMS,
    credentials: infobipSMSConfig,
    docReference: 'https://www.infobip.com/docs',
    logoFileName: { light: 'infobip.png', dark: 'infobip.png' },
  },
  {
    id: SmsProviderIdEnum.BurstSms,
    displayName: 'BurstSMS',
    channel: ChannelTypeEnum.SMS,
    credentials: burstSmsConfig,
    docReference: 'https://developer.transmitsms.com/',
    logoFileName: { light: 'burst-sms.svg', dark: 'burst-sms.svg' },
  },
  {
    id: SmsProviderIdEnum.Clickatell,
    displayName: 'clickatell',
    channel: ChannelTypeEnum.SMS,
    credentials: clickatellConfig,
    betaVersion: true,
    docReference: 'https://docs.clickatell.com/',
    logoFileName: { light: 'clickatell.png', dark: 'clickatell.png' },
  },
  {
<<<<<<< HEAD
    id: SmsProviderIdEnum.Bulksms,
    displayName: 'Bulksms',
    channel: ChannelTypeEnum.SMS,
    credentials: bulksmsConfig,
    docReference: 'http://login.bulksmsoffers.com/apidoc/textsms/send-sms.php',
    logoFileName: { light: 'bulksms.png', dark: 'bulksms.png' },
=======
    id: SmsProviderIdEnum.FortySixElks,
    displayName: '46elks',
    channel: ChannelTypeEnum.SMS,
    credentials: fortySixElksConfig,
    docReference: 'https://46elks.com/docs/send-sms',
    logoFileName: { light: '46elks.png', dark: '46elks.png' },
  },
  {
    id: SmsProviderIdEnum.Kannel,
    displayName: 'Kannel SMS',
    channel: ChannelTypeEnum.SMS,
    credentials: kannelConfig,
    betaVersion: true,
    docReference: 'https://www.kannel.org/doc.shtml',
    logoFileName: { light: 'kannel.png', dark: 'kannel.png' },
>>>>>>> main
  },
];
