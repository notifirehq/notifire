import React, { useMemo } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { useValueEditor, ValueEditorProps } from 'react-querybuilder';

import { completions } from '@/utils/liquid-autocomplete';
import { InputRoot, InputWrapper } from '@/components/primitives/input';
import { Editor } from '@/components/primitives/editor';
import { variables } from '@/components/conditions-editor/conditions-editor';

export const ValueEditor = React.memo((props: ValueEditorProps) => {
  const { value, handleOnChange, operator, type } = props;
  const { valueAsArray, multiValueHandler } = useValueEditor(props);

  const extensions = useMemo(
    () => [
      autocompletion({
        override: [completions(variables)],
      }),
    ],
    []
  );

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  if ((operator === 'between' || operator === 'notBetween') && (type === 'select' || type === 'text')) {
    const editors = ['from', 'to'].map((key, i) => {
      return (
        <InputRoot key={key} size="2xs" className="w-28">
          <InputWrapper className="h-7">
            <Editor
              fontFamily="inherit"
              indentWithTab={false}
              placeholder={'value'}
              className="mt-[4px] overflow-hidden [&_.cm-line]:pl-px"
              extensions={extensions}
              value={valueAsArray[i] ?? ''}
              onChange={(newValue) => multiValueHandler(newValue, i)}
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
        <Editor
          fontFamily="inherit"
          indentWithTab={false}
          placeholder={'value'}
          className="mt-[4px] overflow-hidden [&_.cm-line]:pl-px"
          extensions={extensions}
          value={value ?? ''}
          onChange={handleOnChange}
        />
      </InputWrapper>
    </InputRoot>
  );
});
