import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { z } from 'zod';
import { useCreateWorkflow } from '../../hooks/use-create-workflow';
import { RouteFill } from '../icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../primitives/breadcrumb';
import { Button } from '../primitives/button';
import { CompactButton } from '../primitives/button-compact';
import { Form } from '../primitives/form/form';
import TruncatedText from '../truncated-text';
import { CreateWorkflowForm } from '../workflow-editor/create-workflow-form';
import { workflowSchema } from '../workflow-editor/schema';
import { WorkflowCanvas } from '../workflow-editor/workflow-canvas';
import { WorkflowResults } from './components/workflow-results';
import { getTemplates, IWorkflowSuggestion } from './templates';
import { WorkflowMode } from './types';
import { WorkflowSidebar } from './workflow-sidebar';

const WORKFLOW_TEMPLATES = getTemplates();

export type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();
  const { submit: createFromTemplate, isLoading: isCreating } = useCreateWorkflow();
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [suggestions, setSuggestions] = useState<IWorkflowSuggestion[]>([]);
  const [mode, setMode] = useState<WorkflowMode>(WorkflowMode.TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<IWorkflowSuggestion | null>(null);

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) =>
    selectedCategory === 'popular' ? template.isPopular : template.category === selectedCategory
  );
  const templates = suggestions.length > 0 ? suggestions : filteredTemplates;

  const handleCreateWorkflow = async (values: z.infer<typeof workflowSchema>) => {
    if (!selectedTemplate) return;

    await createFromTemplate(values, selectedTemplate.workflowDefinition);
  };

  const getHeaderText = () => {
    if (selectedTemplate) {
      return selectedTemplate.name;
    }

    if (mode === WorkflowMode.GENERATE) {
      return 'AI Suggested workflows';
    }

    if (mode === WorkflowMode.FROM_PROMPT) {
      return 'Scaffold your workflow';
    }

    if (mode === WorkflowMode.TEMPLATES) {
      return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows`;
    }

    return '';
  };

  const handleTemplateClick = (template: IWorkflowSuggestion) => {
    setSelectedTemplate(template);
  };

  const handleBackClick = () => {
    setSelectedTemplate(null);
    setMode(WorkflowMode.TEMPLATES);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild {...props} />

      <DialogContent className="w-full max-w-[1240px] gap-0 p-0" id="workflow-templates-modal">
        <DialogHeader className="border-stroke-soft flex flex-row items-center gap-1 border-b p-3">
          {selectedTemplate ? (
            <CompactButton size="md" variant="ghost" onClick={handleBackClick} icon={RiArrowLeftSLine}></CompactButton>
          ) : null}
          <Breadcrumb className="!mt-0">
            <BreadcrumbList>
              {selectedTemplate && (
                <>
                  <BreadcrumbItem className="flex items-center gap-1">Templates</BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  <RouteFill className="size-4" />
                  <div className="flex max-w-[32ch]">
                    <TruncatedText>{getHeaderText()}</TruncatedText>
                  </div>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogHeader>
        <div className="flex h-[600px]">
          {!selectedTemplate && (
            <div className="h-full w-[259px] border-r border-neutral-200">
              <WorkflowSidebar
                selectedCategory={selectedCategory}
                onCategorySelect={(category) => {
                  setSelectedCategory(category);
                  setSuggestions([]);
                  setMode(WorkflowMode.TEMPLATES);
                }}
                mode={mode}
              />
            </div>
          )}

          <div className="w-full flex-1 overflow-auto">
            {!selectedTemplate ? (
              <div className="p-3">
                <Form {...form}>
                  <form>
                    <div className="mb-1.5 flex items-center justify-between">
                      <h2 className="text-label-md text-strong">{getHeaderText()}</h2>
                    </div>

                    <WorkflowResults mode={mode} suggestions={templates} onClick={handleTemplateClick} />
                  </form>
                </Form>
              </div>
            ) : (
              <div className="flex h-full w-full gap-4">
                <div className="flex-1">
                  <WorkflowCanvas
                    readOnly
                    steps={
                      selectedTemplate.workflowDefinition.steps.map((step) => ({
                        _id: null,
                        slug: null,
                        stepId: step.name,
                        controls: {
                          values: step.controlValues ?? {},
                        },
                        ...step,
                      })) as any
                    }
                  />
                </div>
                <div className="border-stroke-soft w-full max-w-[300px] border-l p-3">
                  <CreateWorkflowForm onSubmit={handleCreateWorkflow} template={selectedTemplate.workflowDefinition} />
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedTemplate && (
          <DialogFooter className="border-stroke-soft !mx-0 border-t !p-1.5">
            <Button className="ml-auto" mode="gradient" type="submit" form="create-workflow" isLoading={isCreating}>
              Create workflow
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
