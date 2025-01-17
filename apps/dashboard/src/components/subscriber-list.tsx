import { Skeleton } from '@/components/primitives/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { SubscriberListEmpty } from '@/components/subscriber-list-empty';
import { useFetchSubscribers } from '@/hooks/use-fetch-subscribers';
import { RiMore2Fill } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';

export function SubscriberList() {
  const [searchParams] = useSearchParams();

  const cursor = searchParams.get('cursor') || '';
  const query = searchParams.get('query') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const subscriberId = searchParams.get('subscriberId') || '';
  const limit = parseInt(searchParams.get('limit') || '12');

  const { data, isPending, isError } = useFetchSubscribers({
    cursor,
    limit,
    query,
    email,
    phone,
    subscriberId,
  });

  if (isError) return null;

  if (!isPending && data?.subscribers.length === 0) {
    return <SubscriberListEmpty />;
  }

  return (
    <div className="flex h-full flex-col px-2.5 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subscribers</TableHead>
            <TableHead>Email address</TableHead>
            <TableHead>Phone number</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Updated at</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <>
              {new Array(limit).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="flex flex-col gap-1 font-medium">
                    <Skeleton className="h-5 w-[20ch]" />
                    <Skeleton className="h-3 w-[15ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[6ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[8ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[7ch] rounded-full" />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    <Skeleton className="h-5 w-[14ch] rounded-full" />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    <RiMore2Fill className="size-4 opacity-50" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <>{data.subscribers.map((subscriber) => subscriber.subscriberId)}</>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
