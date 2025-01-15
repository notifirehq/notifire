import { type Field, QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import {
  ConditionsEditorProvider,
  useConditionsEditorContext,
} from '@/components/conditions-editor/conditions-editor-context';
import { AddConditionAction } from '@/components/conditions-editor/add-condition-action';
import { AddGroupAction } from '@/components/conditions-editor/add-group-action';
import { OperatorSelector } from '@/components/conditions-editor/operator-selector';
import { CombinatorSelector } from '@/components/conditions-editor/combinator-selector';
import { ValueEditor } from '@/components/conditions-editor/value-editor';
import { FieldSelector } from '@/components/conditions-editor/field-selector';
import { RuleActions } from '@/components/conditions-editor/rule-actions';

const nestedGroupClassName = `[&.ruleGroup_.ruleGroup]:p-3 [&.ruleGroup_.ruleGroup]:bg-neutral-50 [&.ruleGroup_.ruleGroup]:rounded-md [&.ruleGroup_.ruleGroup]:border [&.ruleGroup_.ruleGroup]:border-solid [&.ruleGroup_.ruleGroup]:border-neutral-100`;
const ruleGroupClassName = `[&.ruleGroup]:[background:transparent] [&.ruleGroup]:[border:none] [&.ruleGroup]:p-0 ${nestedGroupClassName}`;

const fields = [
  { name: 'payload.foo', label: 'payload.foo', value: 'payload.foo' },
  { name: 'payload.bar', label: 'payload.bar', value: 'payload.bar' },
  { name: 'payload.baz', label: 'payload.baz', value: 'payload.baz' },
  { name: 'payload.qux', label: 'payload.qux', value: 'payload.qux' },
  { name: 'payload.quux', label: 'payload.quux', value: 'payload.quux' },
  { name: 'payload.corge', label: 'payload.corge', value: 'payload.corge' },
  { name: 'payload.grault', label: 'payload.grault', value: 'payload.grault' },
  { name: 'payload.garply', label: 'payload.garply', value: 'payload.garply' },
  { name: 'payload.waldo', label: 'payload.waldo', value: 'payload.waldo' },
  { name: 'payload.fred', label: 'payload.fred', value: 'payload.fred' },
  { name: 'payload.plugh', label: 'payload.plugh', value: 'payload.plugh' },
  { name: 'payload.xyzzy', label: 'payload.xyzzy', value: 'payload.xyzzy' },
  { name: 'payload.thud', label: 'payload.thud', value: 'payload.thud' },
] satisfies Field[];

export const variables = fields.map((field) => ({ type: 'variable', label: field.label })) satisfies LiquidVariable[];

function InternalConditionsEditor() {
  const { query, setQuery } = useConditionsEditorContext();

  return (
    <QueryBuilder
      fields={fields}
      controlElements={{
        operatorSelector: OperatorSelector,
        combinatorSelector: CombinatorSelector,
        fieldSelector: FieldSelector,
        valueEditor: ValueEditor,
        addRuleAction: AddConditionAction,
        addGroupAction: AddGroupAction,
        removeGroupAction: RuleActions,
        removeRuleAction: RuleActions,
        cloneGroupAction: null,
        cloneRuleAction: null,
      }}
      query={query}
      onQueryChange={setQuery}
      controlClassnames={{
        ruleGroup: ruleGroupClassName,
      }}
      translations={{
        addRule: {
          label: 'Add condition',
          title: 'Add condition',
        },
        addGroup: {
          label: 'Add group',
          title: 'Add group',
        },
      }}
    />
  );
}

export function ConditionsEditor() {
  return (
    <ConditionsEditorProvider>
      <InternalConditionsEditor />
    </ConditionsEditorProvider>
  );
}
