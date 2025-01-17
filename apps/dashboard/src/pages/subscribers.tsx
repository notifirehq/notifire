import { DashboardLayout } from '@/components/dashboard-layout';
import { PageMeta } from '@/components/page-meta';
import { SubscriberList } from '@/components/subscriber-list';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { useEffect } from 'react';

export const SubscribersPage = () => {
  const track = useTelemetry();

  useEffect(() => {
    track(TelemetryEvent.SUBSCRIBERS_PAGE_VISIT);
  }, [track]);

  return (
    <>
      <PageMeta title="Subscribers" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950 flex items-center gap-1">Subscribers</h1>}>
        <div className="flex justify-between px-2.5 py-2.5">
          <div className="invisible flex w-[20ch] items-center gap-2 rounded-lg bg-neutral-50 p-2"></div>
        </div>
        <SubscriberList />
      </DashboardLayout>
    </>
  );
};
