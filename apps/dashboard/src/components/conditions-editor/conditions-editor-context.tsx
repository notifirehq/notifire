import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { RuleGroupType, RuleType, remove, add, isRuleGroup, RuleGroupTypeAny, Path } from 'react-querybuilder';

import { ConditionsEditorContextType } from './types';

export const ConditionsEditorContext = createContext<ConditionsEditorContextType>({
  query: { combinator: 'and', rules: [] },
  setQuery: () => {},
  removeRuleOrGroup: () => {},
  cloneRuleOrGroup: () => {},
  getParentGroup: () => null,
});

export function ConditionsEditorProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  const removeRuleOrGroup = useCallback(
    (path: Path) => {
      setQuery((oldQuery) => remove(oldQuery, path));
    },
    [setQuery]
  );

  const cloneRuleOrGroup = useCallback(
    (ruleOrGroup: RuleGroupTypeAny | RuleType, path: Path = []) => {
      setQuery((oldQuery) => add(oldQuery, { ...ruleOrGroup, id: crypto.randomUUID() } as RuleType, path));
    },
    [setQuery]
  );

  const getParentGroup = useCallback(
    (id?: string) => {
      if (!id) return query;

      const findParent = (group: RuleGroupTypeAny): RuleGroupTypeAny | null => {
        for (const rule of group.rules) {
          if (typeof rule !== 'string' && rule.id === id) {
            return group;
          }

          if (isRuleGroup(rule)) {
            const parent = findParent(rule);
            if (parent) {
              return parent;
            }
          }
        }

        return null;
      };

      return findParent(query);
    },
    [query]
  );

  const contextValue = useMemo(
    () => ({ query, setQuery, removeRuleOrGroup, cloneRuleOrGroup, getParentGroup }),
    [query, setQuery, removeRuleOrGroup, cloneRuleOrGroup, getParentGroup]
  );

  return <ConditionsEditorContext.Provider value={contextValue}>{children}</ConditionsEditorContext.Provider>;
}

export const useConditionsEditorContext = () => useContext(ConditionsEditorContext);
