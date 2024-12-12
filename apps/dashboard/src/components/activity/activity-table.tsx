import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { IActivity, ISubscriber } from '@novu/shared';
import { TimeDisplayHoverCard } from '@/components/time-display-hover-card';
import { createSearchParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from './components/status-badge';
import { StepIndicators } from './components/step-indicators';
import { ArrowPagination } from './components/arrow-pagination';
import { useEffect } from 'react';
import { IActivityFilters } from '@/api/activity';
import { useFetchActivities } from '../../hooks/use-fetch-activities';
import { toast } from 'sonner';
import { Skeleton } from '@/components/primitives/skeleton';

export interface ActivityTableProps {
  selectedActivityId: string | null;
  onActivitySelect: (activity: IActivity) => void;
  filters?: IActivityFilters;
}

export function ActivityTable({ selectedActivityId, onActivitySelect, filters }: ActivityTableProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const page = parsePageParam(searchParams.get('page'));
  const { activities, isLoading, hasMore, error } = useFetchActivities({ filters, page });

  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch activities', {
        description: error instanceof Error ? error.message : 'There was an error loading the activities.',
      });
    }
  }, [error]);

  const handlePageChange = (newPage: number) => {
    const newParams = createSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
    navigate(`${location.pathname}?${newParams}`);
  };

  return (
    <div className="flex min-h-full min-w-[800px] flex-1 flex-col">
      <Table
        isLoading={isLoading}
        loadingRow={<SkeletonRow />}
        containerClassname="border-x-0 border-b-0 border-t border-t-neutral-200 rounded-none shadow-none"
      >
        <TableHeader>
          <TableRow>
            <TableHead className="h-9 px-3 py-0">Event</TableHead>
            <TableHead className="h-9 px-3 py-0">Status</TableHead>
            <TableHead className="h-9 px-3 py-0">Steps</TableHead>
            <TableHead className="h-9 px-3 py-0">Triggered Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activity._id}
              className={cn(
                'relative cursor-pointer hover:bg-neutral-50',
                selectedActivityId === activity._id &&
                  'bg-neutral-50 after:absolute after:right-0 after:top-0 after:h-[calc(100%-1px)] after:w-[5px] after:bg-neutral-200'
              )}
              onClick={() => onActivitySelect(activity)}
            >
              <TableCell className="px-3">
                <div className="flex flex-col">
                  <span className="text-foreground-950 font-medium">
                    {activity.template?.name || 'Deleted workflow'}
                  </span>
                  <span className="text-foreground-400 text-[10px] leading-[14px]">
                    {activity.transactionId} {getSubscriberDisplay(activity.subscriber)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <StatusBadge jobs={activity.jobs} />
              </TableCell>
              <TableCell className="px-3">
                <StepIndicators jobs={activity.jobs} />
              </TableCell>
              <TableCell className="text-foreground-600 px-3">
                <TimeDisplayHoverCard date={new Date(activity.createdAt)}>
                  <span>{formatDate(activity.createdAt)}</span>
                </TimeDisplayHoverCard>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ArrowPagination page={page} hasMore={hasMore} onPageChange={handlePageChange} />
    </div>
  );
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM d yyyy, HH:mm:ss');
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="px-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex h-7 w-28 items-center justify-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex items-center">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="-ml-2 flex h-7 w-7 items-center justify-center first:ml-0">
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell className="px-3">
        <Skeleton className="h-4 w-36 font-mono" />
      </TableCell>
    </TableRow>
  );
}

function getSubscriberDisplay(subscriber?: Pick<ISubscriber, '_id' | 'subscriberId' | 'firstName' | 'lastName'>) {
  if (!subscriber) return '';

  if (subscriber.firstName || subscriber.lastName) {
    return `• ${subscriber.firstName || ''} ${subscriber.lastName || ''}`;
  }

  return '';
}

function parsePageParam(param: string | null): number {
  if (!param) return 0;

  const parsed = Number.parseInt(param, 10);

  return Math.max(0, parsed || 0);
}
