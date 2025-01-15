import { RiCloseLine, RiGuideFill, RiInputField, RiQuestionLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { FeatureFlagsKeysEnum } from '@novu/shared';

import { CompactButton } from '@/components/primitives/button-compact';
import { StepDrawer } from '@/components/workflow-editor/steps/step-drawer';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { Button } from '@/components/primitives/button';
import { Panel, PanelContent, PanelHeader } from '@/components/primitives/panel';
import { ConditionsEditor } from '@/components/conditions-editor/conditions-editor';

export const EditStepConditions = () => {
  const navigate = useNavigate();
  const { workflow, step } = useWorkflow();
  const isStepConditionsEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_STEP_CONDITIONS_ENABLED);

  if (!workflow || !step) {
    return null;
  }

  if (!isStepConditionsEnabled) {
    navigate('..', { relative: 'path' });
    return null;
  }

  return (
    <StepDrawer title={`Edit ${step?.name} Conditions`}>
      <header className="flex flex-row items-center gap-3 border-b border-neutral-200 px-3 py-1.5">
        <div className="mr-auto flex items-center gap-2.5 py-2 text-sm font-medium">
          <RiGuideFill className="size-4" />
          <span>Step Conditions</span>
        </div>

        <CompactButton
          icon={RiCloseLine}
          variant="ghost"
          className="size-6"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('..', { relative: 'path' });
          }}
        >
          <span className="sr-only">Close</span>
        </CompactButton>
      </header>
      <div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-5">
        <Panel className="overflow-initial">
          <PanelHeader>
            <RiInputField className="text-feature size-4" />
            <span className="text-neutral-950">Step conditions for — {step?.name}</span>
          </PanelHeader>
          <PanelContent className="flex flex-col gap-2 border-solid">
            <ConditionsEditor />
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
        <Button type="submit" variant="secondary">
          Save Conditions
        </Button>
      </div>
    </StepDrawer>
  );
};
