import { useFetchActivities } from '@/hooks/use-fetch-activities';
import { useEffect, useState } from 'react';

interface UseActivityByTransactionProps {
  transactionId?: string;
  onActivityFound: (activityId: string) => void;
}

export function useActivityByTransaction({
  transactionId: initialTransactionId,
  onActivityFound,
}: UseActivityByTransactionProps) {
  const [transactionId, setTransactionId] = useState<string | undefined>(initialTransactionId);

  const { activities } = useFetchActivities(
    {
      filters: transactionId ? { transactionId } : undefined,
    },
    {
      enabled: !!transactionId,
      refetchInterval: transactionId ? 1000 : false,
    }
  );

  useEffect(() => {
    if (!activities?.length || !transactionId) return;

    const newActivityId = activities[0]._id;
    if (newActivityId) {
      onActivityFound(newActivityId);
      setTransactionId(undefined);
    }
  }, [activities, transactionId, onActivityFound]);

  return {
    isLoadingTransaction: transactionId && !activities?.[0]?._id,
    setTransactionId,
  };
}
