import React from 'react';
import { useValueEditor, ValueEditorProps } from 'react-querybuilder';

import { InputRoot, InputWrapper } from '@/components/primitives/input';
import { variables } from '@/components/conditions-editor/conditions-editor';
import { ControlInput } from '../primitives/control-input/control-input';

export const ValueEditor = React.memo((props: ValueEditorProps) => {
  const { value, handleOnChange, operator, type } = props;
  const { valueAsArray, multiValueHandler } = useValueEditor(props);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  if ((operator === 'between' || operator === 'notBetween') && (type === 'select' || type === 'text')) {
    const editors = ['from', 'to'].map((key, i) => {
      return (
        <InputRoot key={key} size="2xs" className="w-28">
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
      <div className="flex items-center gap-1">
        {editors[0]}
        <span className="text-foreground-600 text-paragraph-xs">and</span>
        {editors[1]}
      </div>
    );
  }

  return (
    <InputRoot size="2xs" className="w-40">
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
  );
});
