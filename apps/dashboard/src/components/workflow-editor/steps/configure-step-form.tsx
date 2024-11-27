import { ConfirmationModal } from '@/components/confirmation-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { CopyButton } from '@/components/primitives/copy-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent, SidebarFooter, SidebarHeader } from '@/components/side-navigation/sidebar';
import TruncatedText from '@/components/truncated-text';
import { stepSchema } from '@/components/workflow-editor/schema';
import { getFirstBodyErrorMessage, getFirstControlsErrorMessage } from '@/components/workflow-editor/step-utils';
import { ConfigureInAppStepTemplateCta } from '@/components/workflow-editor/steps/in-app/configure-in-app-step-template-cta';
import { SdkBanner } from '@/components/workflow-editor/steps/sdk-banner';
import { STEP_NAME_BY_TYPE } from '@/components/workflow-editor/steps/step-provider';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';
import { buildRoute, ROUTES } from '@/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IEnvironment,
  StepDataDto,
  StepTypeEnum,
  UpdateWorkflowDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
} from '@novu/shared';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseFill, RiDeleteBin2Line, RiPencilRuler2Fill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

type ConfigureStepFormProps = {
  workflow: WorkflowResponseDto;
  environment: IEnvironment;
  step: StepDataDto;
  debouncedUpdate: (data: UpdateWorkflowDto) => void;
  update: (data: UpdateWorkflowDto) => void;
};
export const ConfigureStepForm = (props: ConfigureStepFormProps) => {
  const { step, workflow, debouncedUpdate, update, environment } = props;
  const navigate = useNavigate();

  const isReadOnly = workflow.origin === WorkflowOriginEnum.EXTERNAL || EXCLUDED_EDITOR_TYPES.includes(step.type);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteStep = () => {
    update({ ...workflow, steps: workflow.steps.filter((s) => s._id !== step._id) });
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: environment.slug!, workflowSlug: workflow.slug }));
  };

  const form = useForm<z.infer<typeof stepSchema>>({
    defaultValues: {
      name: step.name,
      stepId: step.stepId,
    },
    resolver: zodResolver(stepSchema),
  });

  useFormAutosave(form, (data) => {
    debouncedUpdate({
      ...workflow,
      steps: workflow.steps.map((s) => {
        if (s._id === step._id) {
          return { ...s, ...data };
        }
        return s;
      }),
    });
  });

  const firstError = useMemo(
    () => (step ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined),
    [step]
  );

  return (
    <>
      <PageMeta title={`Configure ${step.name}`} />
      <motion.div
        className="flex h-full w-full flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.1 }}
        transition={{ duration: 0.1 }}
      >
        <SidebarHeader className="flex items-center gap-2.5 text-sm font-medium">
          <Link
            to={buildRoute(ROUTES.EDIT_WORKFLOW, {
              environmentSlug: environment.slug!,
              workflowSlug: workflow.slug,
            })}
            className="flex items-center"
          >
            <Button variant="link" size="icon" className="size-4" type="button">
              <RiArrowLeftSLine />
            </Button>
          </Link>
          <span>Configure Step</span>
          <Link
            to={buildRoute(ROUTES.EDIT_WORKFLOW, {
              environmentSlug: environment.slug!,
              workflowSlug: workflow.slug,
            })}
            className="ml-auto flex items-center"
          >
            <Button variant="link" size="icon" className="size-4" type="button">
              <RiCloseFill />
            </Button>
          </Link>
        </SidebarHeader>

        <Separator />

        <Form {...form}>
          <form>
            <SidebarContent>
              <FormField
                control={form.control}
                name={'name'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <InputField>
                        <Input placeholder="Untitled" {...field} disabled={isReadOnly} />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'stepId'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <InputField className="flex overflow-hidden pr-0">
                        <Input placeholder="Untitled" className="cursor-default" {...field} readOnly />
                        <CopyButton valueToCopy={field.value} size="input-right" />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SidebarContent>
          </form>
        </Form>
        <Separator />

        {step.type === StepTypeEnum.IN_APP && <ConfigureInAppStepTemplateCta step={step} issue={firstError} />}

        {EXCLUDED_EDITOR_TYPES.includes(step.type) && (
          <>
            <SidebarContent>
              <Link to={'./edit'} relative="path" state={{ stepType: step.type }}>
                <Button
                  variant="outline"
                  className="flex w-full justify-start gap-1.5 text-xs font-medium"
                  type="button"
                >
                  <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
                  Configure {STEP_NAME_BY_TYPE[step.type]} template{' '}
                  <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
                </Button>
              </Link>
            </SidebarContent>
            <Separator />
          </>
        )}

        {isReadOnly && (
          <>
            <SidebarContent>
              <SdkBanner />
            </SidebarContent>
            <Separator />
          </>
        )}

        <Separator />

        {!isReadOnly && (
          <>
            <SidebarFooter>
              <Separator />
              <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={onDeleteStep}
                title="Proceeding will delete the step"
                description={
                  <>
                    You're about to delete the{' '}
                    <strong>
                      <TruncatedText className="max-w-[32ch]">{step.name}</TruncatedText>
                    </strong>{' '}
                    step, this action is permanent.
                  </>
                }
                confirmButtonText="Delete"
              />
              <Button
                variant="ghostDestructive"
                className="gap-1.5 text-xs"
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <RiDeleteBin2Line className="size-4" />
                Delete step
              </Button>
            </SidebarFooter>
          </>
        )}
      </motion.div>
    </>
  );
};
