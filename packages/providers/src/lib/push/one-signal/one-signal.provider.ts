import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import {
  ChannelTypeEnum,
  ISendMessageSuccessResponse,
  IPushOptions,
  IPushProvider,
} from '@novu/stateless';
import { PushProviderIdEnum } from '@novu/shared';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { deepmerge } from '../../../utils/deepmerge.utils';

export class OneSignalPushProvider
  extends BaseProvider
  implements IPushProvider
{
  id = PushProviderIdEnum.OneSignal;
  channelType = ChannelTypeEnum.PUSH as ChannelTypeEnum.PUSH;
  private axiosInstance: AxiosInstance;
  protected casing: CasingEnum = CasingEnum.SNAKE_CASE;
  public readonly BASE_URL = 'https://onesignal.com/api/v1';

  constructor(
    private config: {
      appId: string;
      apiKey: string;
    }
  ) {
    super();
    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
    });
  }

  async sendMessage(
    options: IPushOptions,
    bridgeProviderData: Record<string, unknown> = {}
  ): Promise<ISendMessageSuccessResponse> {
    const { sound, badge, ...overrides } = options.overrides ?? {};

    const notification = deepmerge(
      {
        include_player_ids: options.target,
        app_id: this.config.appId,
        headings: { en: options.title },
        contents: { en: options.content },
        subtitle: { en: overrides.subtitle },
        data: options.payload,
        ios_badge_type: 'Increase',
        ios_badge_count: 1,
        ios_sound: sound,
        android_sound: sound,
        mutable_content: overrides.mutableContent,
        android_channel_id: overrides.channelId,
        small_icon: overrides.icon,
        large_icon: overrides.icon,
        chrome_icon: overrides.icon,
        firefox_icon: overrides.icon,
        ios_category: overrides.categoryId,
      },
      this.transform(bridgeProviderData).body
    );

    const notificationOptions: AxiosRequestConfig = {
      url: '/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.config.apiKey}`,
      },
      data: JSON.stringify(notification),
    };

    const res = await this.axiosInstance.request<{ id: string }>(
      notificationOptions
    );

    return {
      id: res?.data.id,
      date: new Date().toISOString(),
    };
  }
}
