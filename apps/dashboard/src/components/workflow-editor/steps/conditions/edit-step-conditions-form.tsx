import { useMemo } from 'react';
import { RiInputField, RiQuestionLine } from 'react-icons/ri';
import { Link, useBlocker } from 'react-router-dom';
import { formatQuery, RQBJsonLogic, RuleGroupType, RuleType } from 'react-querybuilder';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { prepareRuleGroup } from 'react-querybuilder';
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic';
import type { StepUpdateDto } from '@novu/shared';

import { Button } from '@/components/primitives/button';
import { Panel, PanelContent, PanelHeader } from '@/components/primitives/panel';
import { ConditionsEditor } from '@/components/conditions-editor/conditions-editor';
import { Form, FormField } from '@/components/primitives/form/form';
import { parseStepVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { updateStepInWorkflow } from '@/components/workflow-editor/step-utils';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { UnsavedChangesAlertDialog } from '@/components/unsaved-changes-alert-dialog';
import { useBeforeUnload } from '@/hooks/use-before-unload';

const rulesSchema: z.ZodType<RuleType | RuleGroupType> = z.union([
  z
    .object({
      field: z.string().min(1),
      operator: z.string(),
      value: z.string().nullable(),
    })
    .passthrough()
    .superRefine(({ operator, value }, ctx) => {
      if (operator === 'between' || operator === 'notBetween') {
        const values = value?.split(',').filter((val) => val.trim() !== '');
        if (!values || values.length !== 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Both values are required', path: ['value'] });
        }
      } else if (operator !== 'null' && operator !== 'notNull') {
        const trimmedValue = value?.trim();
        if (!trimmedValue || trimmedValue.length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Value is required', path: ['value'] });
        }
      }
    }),
  z
    .object({
      combinator: z.string(),
      rules: z.array(z.lazy(() => rulesSchema)),
    })
    .passthrough(),
]);

type FormQuery = {
  query: RuleGroupType;
};

const conditionsSchema: z.ZodType<FormQuery> = z.object({
  query: z
    .object({
      combinator: z.string(),
      rules: z.array(rulesSchema),
    })
    .passthrough(),
});

export const EditStepConditionsForm = () => {
  const { workflow, step, update } = useWorkflow();
  const query = useMemo(
    () =>
      // prepareRuleGroup and parseJsonLogic calls are needed to generate the unique ids on the query and rules,
      // otherwise the lib will do it and it will result in the form being dirty
      step?.controls.values.skip
        ? prepareRuleGroup(parseJsonLogic(step.controls.values.skip as RQBJsonLogic))
        : prepareRuleGroup({ combinator: 'and', rules: [] }),
    [step]
  );
  const form = useForm<FormQuery>({
    mode: 'onSubmit',
    resolver: zodResolver(conditionsSchema),
    defaultValues: {
      query,
    },
  });
  const { formState } = form;
  const blocker = useBlocker(formState.isDirty);
  useBeforeUnload(formState.isDirty);

  const { fields, variables } = useMemo(() => {
    if (!step) return { fields: [], variables: [] };

    const parsedVariables = parseStepVariables(step.variables);
    return {
      fields: parsedVariables.primitives.map((primitive) => ({
        name: primitive.label,
        label: primitive.label,
        value: primitive.label,
      })),
      variables: [...parsedVariables.primitives, ...parsedVariables.namespaces],
    };
  }, [step]);

  const onSubmit = (values: z.infer<typeof conditionsSchema>) => {
    if (!step || !workflow) return;

    const skip = formatQuery(values.query, 'jsonlogic');
    const updateStepData: Partial<StepUpdateDto> = {
      controlValues: { ...step.controls.values, skip },
    };

    update(updateStepInWorkflow(workflow, step.stepId, updateStepData));
    form.reset(values);
  };

  return (
    <>
      <Form {...form}>
        <form className="flex h-full flex-col" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-5">
            <Panel className="overflow-initial">
              <PanelHeader>
                <RiInputField className="text-feature size-4" />
                <span className="text-neutral-950">Step conditions for — {step?.name}</span>
              </PanelHeader>
              <PanelContent className="flex flex-col gap-2 border-solid">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <ConditionsEditor
                      query={field.value}
                      onQueryChange={field.onChange}
                      fields={fields}
                      variables={variables}
                    />
                  )}
                />
              </PanelContent>
            </Panel>
            <Link
              target="_blank"
              to={'https://docs.novu.co/workflow/step-conditions'}
              className="mt-2 flex w-max items-center gap-1 text-xs text-neutral-600 hover:underline"
            >
              <RiQuestionLine className="size-4" /> Learn more about conditional step execution
            </Link>
          </div>
          <div className="mt-auto flex justify-end border-t border-neutral-200 p-3">
            <Button type="submit" variant="secondary" disabled={!formState.isDirty}>
              Save Conditions
            </Button>
          </div>
        </form>
      </Form>
      <UnsavedChangesAlertDialog blocker={blocker} />
    </>
  );
};
