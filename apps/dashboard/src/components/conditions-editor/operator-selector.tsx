import { OperatorSelectorProps } from 'react-querybuilder';

import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { cn } from '@/utils/ui';
import { toSelectOptions } from '@/components/conditions-editor/select-option-utils';

export const OperatorSelector = ({ disabled, value, options, handleOnChange }: OperatorSelectorProps) => {
  return (
    <Select onValueChange={handleOnChange} disabled={disabled} value={value}>
      <SelectTrigger
        size="2xs"
        className={cn('w-18 bg-background hover:bg-bg-weak hover:text-text-strong text-label-xs gap-1')}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={cn('min-w-18 text-label-xs max-h-48 gap-1')}>
        {toSelectOptions(options, false)}
      </SelectContent>
    </Select>
  );
};
