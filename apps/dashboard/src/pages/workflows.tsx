import { DashboardLayout } from '@/components/dashboard-layout';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { ScrollArea, ScrollBar } from '@/components/primitives/scroll-area';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useFetchWorkflows } from '@/hooks/use-fetch-workflows';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { FeatureFlagsKeysEnum, StepTypeEnum } from '@novu/shared';
import { useEffect } from 'react';
import { RiArrowDownSLine, RiFileAddLine, RiFileMarkedLine, RiRouteFill } from 'react-icons/ri';
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ButtonGroupItem, ButtonGroupRoot } from '../components/primitives/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/primitives/dropdown-menu';
import { getTemplates, WorkflowTemplate } from '../components/template-store/templates';
import { WorkflowCard } from '../components/template-store/workflow-card';
import { WorkflowTemplateModal } from '../components/template-store/workflow-template-modal';
import { WorkflowList } from '../components/workflow-list';
import { buildRoute, ROUTES } from '../utils/routes';

export const TemplateModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams();
  const templates = getTemplates();
  const selectedTemplate = templateId ? templates.find((template) => template.id === templateId) : undefined;

  const handleCloseTemplateModal = () => {
    navigate(`..${location.search}`);
  };

  return (
    <WorkflowTemplateModal open={true} onOpenChange={handleCloseTemplateModal} selectedTemplate={selectedTemplate} />
  );
};

export const WorkflowsPage = () => {
  const { environmentSlug } = useParams();
  const track = useTelemetry();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTemplateStoreEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V2_TEMPLATE_STORE_ENABLED);
  const templates = getTemplates();
  const popularTemplates = templates.filter((template) => template.isPopular).slice(0, 4);

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '12');

  const {
    data: workflowsData,
    isPending,
    isError,
  } = useFetchWorkflows({
    limit,
    offset,
  });

  const shouldShowStartWith = isTemplateStoreEnabled && (!workflowsData || workflowsData.totalCount < 5);

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

  const handleTemplateClick = (template: WorkflowTemplate) => {
    track(TelemetryEvent.TEMPLATE_WORKFLOW_CLICK);

    navigate(
      buildRoute(ROUTES.TEMPLATE_STORE_CREATE_WORKFLOW, {
        environmentSlug: environmentSlug || '',
        templateId: template.id,
      })
    );
  };

  return (
    <>
      <PageMeta title="Workflows" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950 flex items-center gap-1">Workflows</h1>}>
        <OptInModal />
        <div className="h-full w-full">
          <div className="flex justify-between px-2.5 py-2.5">
            <div className="invisible flex w-[20ch] items-center gap-2 rounded-lg bg-neutral-50 p-2"></div>
            {isTemplateStoreEnabled ? (
              <ButtonGroupRoot size="xs">
                <ButtonGroupItem asChild className="gap-1">
                  <Button
                    mode="gradient"
                    className="rounded-l-lg rounded-r-none border-none p-2 text-white"
                    variant="primary"
                    size="xs"
                    leadingIcon={RiRouteFill}
                    onClick={() =>
                      navigate(buildRoute(ROUTES.WORKFLOWS_CREATE, { environmentSlug: environmentSlug || '' }))
                    }
                  >
                    Create workflow
                  </Button>
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
                        <div
                          className="w-full"
                          onClick={() => {
                            track(TelemetryEvent.CREATE_WORKFLOW_CLICK);
                            navigate(buildRoute(ROUTES.WORKFLOWS_CREATE, { environmentSlug: environmentSlug || '' }));
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <RiFileAddLine />
                            Blank Workflow
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() =>
                          navigate(buildRoute(ROUTES.TEMPLATE_STORE, { environmentSlug: environmentSlug || '' }))
                        }
                      >
                        <RiFileMarkedLine />
                        View Workflow Gallery
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroupItem>
              </ButtonGroupRoot>
            ) : (
              <Button
                mode="gradient"
                variant="primary"
                size="xs"
                leadingIcon={RiRouteFill}
                onClick={() =>
                  navigate(buildRoute(ROUTES.WORKFLOWS_CREATE, { environmentSlug: environmentSlug || '' }))
                }
              >
                Create workflow
              </Button>
            )}
          </div>
          {shouldShowStartWith && (
            <div className="px-2.5 py-2">
              <div className="text-label-xs text-text-soft mb-2">Start with</div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      track(TelemetryEvent.CREATE_WORKFLOW_CLICK);

                      navigate(buildRoute(ROUTES.WORKFLOWS_CREATE, { environmentSlug: environmentSlug || '' }));
                    }}
                  >
                    <WorkflowCard name="Blank workflow" description="Create a blank workflow" steps={[]} />
                  </div>
                  {popularTemplates.map((template) => (
                    <WorkflowCard
                      key={template.id}
                      name={template.name}
                      description={template.description}
                      steps={template.workflowDefinition.steps.map((step) => step.type as StepTypeEnum)}
                      onClick={() => handleTemplateClick(template)}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          <div className="px-2.5 py-2">
            {shouldShowStartWith && <div className="text-label-xs text-text-soft mb-2">Your Workflows</div>}
            <WorkflowList data={workflowsData} isPending={isPending} isError={isError} limit={limit} />
          </div>
        </div>
        <Outlet />
      </DashboardLayout>
    </>
  );
};
