import { getSubscribers } from '@/api/subscribers';
import { QueryKeys } from '@/utils/query-keys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEnvironment } from '../context/environment/hooks';

interface UseSubscribersParams {
  cursor?: string;
  query?: string;
  email?: string;
  phone?: string;
  subscriberId?: string;
  limit?: number;
}

export function useFetchSubscribers({
  cursor = '',
  query = '',
  email = '',
  phone = '',
  subscriberId = '',
  limit = 12,
}: UseSubscribersParams = {}) {
  const { currentEnvironment } = useEnvironment();

  const subscribersQuery = useQuery({
    queryKey: [
      QueryKeys.fetchSubscribers,
      currentEnvironment?._id,
      { cursor, limit, query, email, phone, subscriberId },
    ],
    queryFn: () =>
      getSubscribers({ environment: currentEnvironment!, cursor, limit, query, email, phone, subscriberId }),
    placeholderData: keepPreviousData,
    enabled: !!currentEnvironment?._id,
    refetchOnWindowFocus: true,
  });

  return {
    ...subscribersQuery,
  };
}
