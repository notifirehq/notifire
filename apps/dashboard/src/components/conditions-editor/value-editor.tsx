import React from 'react';
import { useValueEditor, ValueEditorProps } from 'react-querybuilder';
import { useFormContext } from 'react-hook-form';

import { InputRoot, InputWrapper } from '@/components/primitives/input';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { ControlInput } from '../primitives/control-input/control-input';

export const ValueEditor = React.memo((props: ValueEditorProps) => {
  const form = useFormContext();
  const queryPath = 'query.rules.' + props.path.join('.rules.') + '.value';
  const { error } = form.getFieldState(queryPath, form.formState);
  const { variables } = props.context as { variables: LiquidVariable[] };
  const { value, handleOnChange, operator, type } = props;
  const { valueAsArray, multiValueHandler } = useValueEditor(props);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  if ((operator === 'between' || operator === 'notBetween') && (type === 'select' || type === 'text')) {
    const editors = ['from', 'to'].map((key, i) => {
      return (
        <InputRoot key={key} size="2xs" className="w-28" hasError={!!error && !valueAsArray[i]}>
          <InputWrapper className="h-7">
            <ControlInput
              multiline={false}
              indentWithTab={false}
              placeholder="value"
              value={valueAsArray[i] ?? ''}
              onChange={(newValue) => multiValueHandler(newValue, i)}
              variables={variables}
            />
          </InputWrapper>
        </InputRoot>
      );
    });

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-1">
          {editors[0]}
          <span className="text-foreground-600 text-paragraph-xs mt-1.5">and</span>
          {editors[1]}
        </div>
        {error && <span className="text-destructive text-xs">{error?.message}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <InputRoot size="2xs" className="w-40" hasError={!!error}>
        <InputWrapper className="h-7">
          <ControlInput
            multiline={false}
            indentWithTab={false}
            placeholder="value"
            value={value ?? ''}
            onChange={handleOnChange}
            variables={variables}
          />
        </InputWrapper>
      </InputRoot>
      {error && <span className="text-destructive text-xs">{error?.message}</span>}
    </div>
  );
});
