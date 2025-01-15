import { useMemo } from 'react';
import { isRuleGroup, ActionWithRulesProps, getParentPath } from 'react-querybuilder';
import { RiMore2Fill } from 'react-icons/ri';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { useConditionsEditorContext } from './conditions-editor-context';
import { CompactButton } from '@/components/primitives/button-compact';
import { Delete } from '@/components/icons/delete';
import { SquareTwoStack } from '@/components/icons/square-two-stack';

export const RuleActions = ({ path, ruleOrGroup }: ActionWithRulesProps) => {
  const { removeRuleOrGroup, cloneRuleOrGroup, getParentGroup } = useConditionsEditorContext();
  const parentGroup = useMemo(() => getParentGroup(ruleOrGroup.id), [ruleOrGroup.id, getParentGroup]);
  const isGroup = isRuleGroup(ruleOrGroup);
  const isDuplicateDisabled = !!(parentGroup && parentGroup.rules && parentGroup.rules.length >= 10);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <CompactButton
          icon={RiMore2Fill}
          variant="ghost"
          size="lg"
          className="ml-auto size-7 [&_svg]:size-4"
        ></CompactButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuGroup className="*:cursor-pointer">
          <DropdownMenuItem
            onClick={() => {
              cloneRuleOrGroup(ruleOrGroup, getParentPath(path));
            }}
            className="text-foreground-600 h-7 text-xs"
            disabled={isDuplicateDisabled}
          >
            <SquareTwoStack className="[&&]:size-3.5" /> Duplicate {isGroup ? `group` : `condition`}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => removeRuleOrGroup(path)} className="text-error-base h-7 text-xs">
            <Delete className="[&&]:size-3.5" />
            Delete {isGroup ? `group` : `condition`}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
