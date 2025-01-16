import { createContext, useCallback, useContext, useMemo } from 'react';
import { RuleType, remove, add, isRuleGroup, RuleGroupTypeAny, Path, RuleGroupType } from 'react-querybuilder';

import { ConditionsEditorContextType } from './types';
import { useDataRef } from '@/hooks/use-data-ref';

export const ConditionsEditorContext = createContext<ConditionsEditorContextType>({
  query: { combinator: 'and', rules: [] },
  setQuery: () => {},
  removeRuleOrGroup: () => {},
  cloneRuleOrGroup: () => {},
  getParentGroup: () => null,
});

export function ConditionsEditorProvider({
  children,
  query,
  onQueryChange,
}: {
  children: React.ReactNode;
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
}) {
  const queryRef = useDataRef(query);
  const queryChangeRef = useDataRef(onQueryChange);
  const removeRuleOrGroup = useCallback(
    (path: Path) => {
      queryChangeRef.current(remove(queryRef.current, path));
    },
    [queryChangeRef, queryRef]
  );

  const cloneRuleOrGroup = useCallback(
    (ruleOrGroup: RuleGroupTypeAny | RuleType, path: Path = []) => {
      queryChangeRef.current(add(queryRef.current, { ...ruleOrGroup, id: crypto.randomUUID() } as RuleType, path));
    },
    [queryChangeRef, queryRef]
  );

  const setQuery = useCallback((query: RuleGroupType) => queryChangeRef.current(query), [queryChangeRef]);

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
