import { type CombinatorSelectorProps } from 'react-querybuilder';

import { RepeatRoundLine } from '@/components/icons/repeat-round-line';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { cn } from '@/utils/ui';
import { toSelectOptions } from '@/components/conditions-editor/select-option-utils';

export const CombinatorSelector = ({ disabled, value, options, handleOnChange }: CombinatorSelectorProps) => {
  return (
    <Select onValueChange={handleOnChange} disabled={disabled} value={value}>
      <SelectTrigger
        size="2xs"
        className={cn('w-18 hover:bg-bg-weak hover:text-text-strong gap-1 text-xs')}
        rightIcon={<RepeatRoundLine className="text-foreground-600 size-4" />}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={cn('min-w-18 gap-1 text-xs')}>{toSelectOptions(options)}</SelectContent>
    </Select>
  );
};
