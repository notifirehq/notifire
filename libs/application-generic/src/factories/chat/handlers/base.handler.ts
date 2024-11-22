import { type IChatOptions, type IChatProvider } from '@novu/stateless';
import { type ChannelTypeEnum, type ChatProviderIdEnum } from '@novu/shared';
import { type IChatHandler } from '../interfaces';

export abstract class BaseChatHandler implements IChatHandler {
  protected provider: IChatProvider;

  protected constructor(
    private providerId: ChatProviderIdEnum,
    private channelType: string,
  ) {}

  canHandle(providerId: string, channelType: ChannelTypeEnum) {
    return providerId === this.providerId && channelType === this.channelType;
  }

  abstract buildProvider(credentials);

  async send(chatContent: IChatOptions) {
    if (process.env.NODE_ENV === 'test') {
      return {};
    }

    const { bridgeProviderData, ...content } = chatContent;

    return await this.provider.sendMessage(content, bridgeProviderData);
  }
}
