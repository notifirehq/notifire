import type { IEnvironment, ListSubscriberResponse } from '@novu/shared';
import { getV2 } from './api.client';

export const getSubscribers = async ({
  environment,
  cursor,
  limit,
  query,
  email,
  phone,
  subscriberId,
}: {
  environment: IEnvironment;
  cursor: string;
  query: string;
  limit: number;
  email?: string;
  phone?: string;
  subscriberId?: string;
}): Promise<ListSubscriberResponse> => {
  const { data } = await getV2<{ data: ListSubscriberResponse }>(
    `/subscribers?cursor=${cursor}&limit=${limit}&query=${query}&email=${email}&phone=${phone}&subscriberId=${subscriberId}`,
    {
      environment,
    }
  );
  return data;
};
