import { PAUSE_MODAL_TITLE, PauseModalDescription } from '@/components/pause-workflow-dialog';
import { Badge } from '@/components/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { TableCell, TableRow } from '@/components/primitives/table';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@/components/primitives/tooltip';
import TruncatedText from '@/components/truncated-text';
import { WorkflowStatus } from '@/components/workflow-status';
import { WorkflowSteps } from '@/components/workflow-steps';
import { WorkflowTags } from '@/components/workflow-tags';
import { useEnvironment } from '@/context/environment/hooks';
import { useDeleteWorkflow } from '@/hooks/use-delete-workflow';
import { usePatchWorkflow } from '@/hooks/use-patch-workflow';
import { useSyncWorkflow } from '@/hooks/use-sync-workflow';
import { WorkflowOriginEnum, WorkflowStatusEnum } from '@/utils/enums';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
import { cn } from '@/utils/ui';
import { IEnvironment, WorkflowListResponseDto } from '@novu/shared';
import { ComponentProps, useState } from 'react';
import { FaCode } from 'react-icons/fa6';
import {
  RiDeleteBin2Line,
  RiFlashlightLine,
  RiGitPullRequestFill,
  RiMore2Fill,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiPulseFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { type ExternalToast } from 'sonner';
import { ConfirmationModal } from './confirmation-modal';
import { DeleteWorkflowDialog } from './delete-workflow-dialog';
import { CompactButton } from './primitives/button-compact';
import { CopyButton } from './primitives/copy-button';
import { ToastIcon } from './primitives/sonner';
import { showToast } from './primitives/sonner-helpers';
import { TimeDisplayHoverCard } from './time-display-hover-card';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

const toastOptions: ExternalToast = {
  position: 'bottom-right',
  classNames: {
    toast: 'mb-4 right-0',
  },
};

type WorkflowLinkTableCellProps = ComponentProps<typeof TableCell> & {
  workflow: WorkflowListResponseDto;
};

const WorkflowLinkTableCell = (props: WorkflowLinkTableCellProps) => {
  const { workflow, children, className, ...rest } = props;
  const { currentEnvironment } = useEnvironment();
  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;

  const workflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.EDIT_WORKFLOW, {
        workflowId: workflow._id,
      })
    : buildRoute(ROUTES.EDIT_WORKFLOW, {
        environmentSlug: currentEnvironment?.slug ?? '',
        workflowSlug: workflow.slug,
      });

  return (
    <TableCell className={cn('group-hover:bg-neutral-alpha-50 relative', className)} {...rest}>
      {children}
      <Link to={workflowLink} className={cn('absolute inset-0')} reloadDocument={isV1Workflow}>
        <span className="sr-only">Edit workflow</span>
      </Link>
    </TableCell>
  );
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const { currentEnvironment } = useEnvironment();
  const { safeSync, isSyncable, tooltipContent, PromoteConfirmModal } = useSyncWorkflow(workflow);

  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;
  const triggerWorkflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.TEST_WORKFLOW, { workflowId: workflow._id })
    : buildRoute(ROUTES.TEST_WORKFLOW, {
        environmentSlug: currentEnvironment?.slug ?? '',
        workflowSlug: workflow.slug,
      });

  const { deleteWorkflow, isPending: isDeleteWorkflowPending } = useDeleteWorkflow({
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">
              Deleted workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to delete workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
  });

  const onDeleteWorkflow = async () => {
    await deleteWorkflow({
      workflowSlug: workflow.slug,
    });
  };

  const { patchWorkflow, isPending: isPauseWorkflowPending } = usePatchWorkflow({
    onSuccess: (data) => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">
              {data.active ? 'Enabled' : 'Paused'} workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
    onError: (_, { workflow }) => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to {workflow.active ? 'enable' : 'pause'} workflow{' '}
              <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
  });

  const onPauseWorkflow = async () => {
    await patchWorkflow({
      workflowSlug: workflow.slug,
      workflow: {
        active: workflow.status === WorkflowStatusEnum.ACTIVE ? false : true,
      },
    });
  };

  const handlePauseWorkflow = () => {
    if (workflow.status === WorkflowStatusEnum.ACTIVE) {
      setIsPauseModalOpen(true);
      return;
    }
    onPauseWorkflow();
  };

  return (
    <TableRow key={workflow._id} className="group relative isolate">
      <PromoteConfirmModal />
      <WorkflowLinkTableCell workflow={workflow} className="font-medium">
        <div className="flex items-center gap-1">
          {workflow.origin === WorkflowOriginEnum.EXTERNAL && (
            <Badge variant="warning" kind="pill">
              <FaCode className="size-3" />
            </Badge>
          )}
          <TruncatedText className="max-w-[32ch]">{workflow.name}</TruncatedText>
        </div>
        <div className="flex items-center gap-1 transition-opacity duration-200">
          <TruncatedText className="text-foreground-400 font-code block text-xs">{workflow.workflowId}</TruncatedText>

          <CopyButton
            className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
            valueToCopy={workflow.workflowId}
            size="2xs"
            mode="ghost"
          ></CopyButton>
        </div>
      </WorkflowLinkTableCell>
      <WorkflowLinkTableCell workflow={workflow} className="min-w-[200px]">
        <WorkflowStatus status={workflow.status} />
      </WorkflowLinkTableCell>
      <WorkflowLinkTableCell workflow={workflow}>
        <WorkflowSteps steps={workflow.stepTypeOverviews} />
      </WorkflowLinkTableCell>
      <WorkflowLinkTableCell workflow={workflow}>
        <WorkflowTags tags={workflow.tags || []} />
      </WorkflowLinkTableCell>

      <WorkflowLinkTableCell workflow={workflow} className="text-foreground-600 min-w-[180px] text-sm font-medium">
        <TimeDisplayHoverCard date={new Date(workflow.updatedAt)}>
          {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </TimeDisplayHoverCard>
      </WorkflowLinkTableCell>

      <WorkflowLinkTableCell workflow={workflow} className="w-1">
        <DeleteWorkflowDialog
          workflow={workflow}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={onDeleteWorkflow}
          isLoading={isDeleteWorkflowPending}
        />
        <ConfirmationModal
          open={isPauseModalOpen}
          onOpenChange={setIsPauseModalOpen}
          onConfirm={async () => {
            await onPauseWorkflow();
            setIsPauseModalOpen(false);
          }}
          title={PAUSE_MODAL_TITLE}
          description={<PauseModalDescription workflowName={workflow.name} />}
          confirmButtonText="Proceed"
          isLoading={isPauseWorkflowPending}
        />
        {/**
         * Needs modal={false} to prevent the click freeze after the modal is closed
         */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <CompactButton
              icon={RiMore2Fill}
              variant="ghost"
              className="z-10 h-8 w-8 p-0"
              data-testid="workflow-actions-menu"
            ></CompactButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link to={triggerWorkflowLink} reloadDocument={isV1Workflow}>
                <DropdownMenuItem className="cursor-pointer">
                  <RiPlayCircleLine />
                  Trigger workflow
                </DropdownMenuItem>
              </Link>
              <SyncWorkflowMenuItem
                currentEnvironment={currentEnvironment}
                isSyncable={isSyncable}
                tooltipContent={tooltipContent}
                onSync={safeSync}
              />
              <Link
                to={
                  buildRoute(ROUTES.ACTIVITY_FEED, {
                    environmentSlug: currentEnvironment?.slug ?? '',
                  }) +
                  '?' +
                  new URLSearchParams({ workflows: workflow._id }).toString()
                }
              >
                <DropdownMenuItem className="cursor-pointer">
                  <RiPulseFill />
                  View activity
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="*:cursor-pointer">
              <DropdownMenuItem
                onClick={handlePauseWorkflow}
                disabled={workflow.status === WorkflowStatusEnum.ERROR}
                data-testid={workflow.status === WorkflowStatusEnum.ACTIVE ? 'pause-workflow' : 'enable-workflow'}
              >
                {workflow.status === WorkflowStatusEnum.ACTIVE ? (
                  <>
                    <RiPauseCircleLine />
                    Pause workflow
                  </>
                ) : (
                  <>
                    <RiFlashlightLine />
                    Enable workflow
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={workflow.origin === WorkflowOriginEnum.EXTERNAL}
                onClick={() => {
                  setIsDeleteModalOpen(true);
                }}
                data-testid="delete-workflow"
              >
                <RiDeleteBin2Line />
                Delete workflow
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </WorkflowLinkTableCell>
    </TableRow>
  );
};

const SyncWorkflowMenuItem = ({
  currentEnvironment,
  isSyncable,
  tooltipContent,
  onSync,
}: {
  currentEnvironment: IEnvironment | undefined;
  isSyncable: boolean;
  tooltipContent: string | undefined;
  onSync: () => void;
}) => {
  const syncToLabel = `Sync to ${currentEnvironment?.name === 'Production' ? 'Development' : 'Production'}`;

  if (isSyncable) {
    return (
      <DropdownMenuItem onClick={onSync}>
        <RiGitPullRequestFill />
        {syncToLabel}
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <DropdownMenuItem disabled>
          <RiGitPullRequestFill />
          {syncToLabel}
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};
