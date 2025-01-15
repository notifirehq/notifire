import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { WorkflowList } from '@/components/workflow-list';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { useEffect, useState } from 'react';
import { RiArrowDownSLine, RiFileAddLine, RiFileMarkedLine, RiRouteFill } from 'react-icons/ri';
import { ButtonGroupItem, ButtonGroupRoot } from '../components/primitives/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/primitives/dropdown-menu';
import { WorkflowTemplateModal } from '../components/template-store/workflow-template-modal';

export const WorkflowsPage = () => {
  const track = useTelemetry();
  const isTemplateStoreEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V2_TEMPLATE_STORE_ENABLED);
  const [shouldOpenTemplateModal, setShouldOpenTemplateModal] = useState(false);

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

  return (
    <>
      <PageMeta title="Workflows" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950 flex items-center gap-1">Workflows</h1>}>
        <OptInModal />
        <div className="flex justify-between px-2.5 py-2.5">
          <div className="invisible flex w-[20ch] items-center gap-2 rounded-lg bg-neutral-50 p-2"></div>

          {isTemplateStoreEnabled ? (
            <ButtonGroupRoot size="xs">
              <ButtonGroupItem asChild className="gap-1">
                <CreateWorkflowButton asChild>
                  <Button
                    mode="gradient"
                    className="rounded-l-lg rounded-r-none border-none p-2 text-white"
                    variant="primary"
                    size="xs"
                    leadingIcon={RiRouteFill}
                  >
                    Create workflow
                  </Button>
                </CreateWorkflowButton>
              </ButtonGroupItem>
              <ButtonGroupItem asChild>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      mode="gradient"
                      className="rounded-l-none rounded-r-lg border-none text-white"
                      variant="primary"
                      size="xs"
                      leadingIcon={RiArrowDownSLine}
                    ></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <CreateWorkflowButton className="w-full">
                        <div className="flex items-center gap-2">
                          <RiFileAddLine />
                          Blank Workflow
                        </div>
                      </CreateWorkflowButton>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onSelect={() => setShouldOpenTemplateModal(true)}>
                      <RiFileMarkedLine />
                      View Template Gallery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroupItem>
            </ButtonGroupRoot>
          ) : (
            <CreateWorkflowButton asChild>
              <Button mode="gradient" variant="primary" size="xs" leadingIcon={RiRouteFill}>
                Create workflow
              </Button>
            </CreateWorkflowButton>
          )}
          {shouldOpenTemplateModal && (
            <WorkflowTemplateModal open={true} onOpenChange={setShouldOpenTemplateModal}>
              <></>
            </WorkflowTemplateModal>
          )}
        </div>
        <WorkflowList />
      </DashboardLayout>
    </>
  );
};
