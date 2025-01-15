import { BaseOption, RuleGroupType, RuleGroupTypeAny, RuleType, Path } from 'react-querybuilder';

export interface ConditionsEditorContextType {
  query: RuleGroupType;
  setQuery: (query: RuleGroupType) => void;
  removeRuleOrGroup: (path: Path) => void;
  cloneRuleOrGroup: (ruleOrGroup: RuleGroupTypeAny | RuleType, path?: Path) => void;
  getParentGroup: (id?: string) => RuleGroupTypeAny | null;
}

export interface VariablesListProps {
  options: Array<BaseOption<string>>;
  onSelect: (value: string) => void;
  value?: string;
}
