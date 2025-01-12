import { useState } from 'react';

import { ActivityPanel } from '@/components/activity/activity-panel';
import { WorkflowTriggerInboxIllustration } from '../../icons/workflow-trigger-inbox';

type TestWorkflowLogsSidebarProps = {
  transactionId?: string;
};

export const TestWorkflowLogsSidebar = ({ transactionId }: TestWorkflowLogsSidebarProps) => {
  const [activityId, setActivityId] = useState<string>();

  console.log(transactionId, activityId);
  return (
    <aside className="flex h-full flex-col">
      {transactionId ? (
        <ActivityPanel
          activityId={activityId}
          transactionId={transactionId}
          onActivitySelect={setActivityId}
          headerClassName="h-[49px]"
          overviewHeaderClassName="border-t-0"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <div>
            <WorkflowTriggerInboxIllustration />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-foreground-400 max-w-[30ch] text-sm">
              No logs to show, trigger test run to see event logs appear here
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
