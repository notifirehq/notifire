import { PageMeta } from '@/components/page-meta';
import { CreateEnvironmentButton } from '../components/create-environment-button';
import { DashboardLayout } from '../components/dashboard-layout';
import { EnvironmentsList } from '../components/environments-list';

export function EnvironmentsPage() {
  return (
    <>
      <PageMeta title={`Environments`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Environments</h1>}>
        <div className="flex flex-col justify-between gap-2 px-2.5 py-2.5">
          <div className="flex justify-end">
            <CreateEnvironmentButton />
          </div>
          <EnvironmentsList />
        </div>
      </DashboardLayout>
    </>
  );
}
