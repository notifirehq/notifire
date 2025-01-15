import { useMemo } from 'react';
import { FieldSelectorProps } from 'react-querybuilder';

import { Code2 } from '@/components/icons/code-2';
import { VariableSelect } from '@/components/conditions-editor/variable-select';

export const FieldSelector = ({ handleOnChange, options, ...restFieldSelectorProps }: FieldSelectorProps) => {
  const optionsArray = useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: 'value' in option ? option.value : '',
      })),
    [options]
  );

  return (
    <VariableSelect
      leftIcon={<Code2 className="text-feature size-3 min-w-3" />}
      onChange={handleOnChange}
      options={optionsArray}
      {...restFieldSelectorProps}
    />
  );
};
