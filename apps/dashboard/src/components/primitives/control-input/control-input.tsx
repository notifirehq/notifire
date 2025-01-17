import { autocompletion } from '@codemirror/autocomplete';
import { EditorView } from '@uiw/react-codemirror';

import { Editor } from '@/components/primitives/editor';
import { Popover, PopoverTrigger } from '@/components/primitives/popover';
import { createAutocompleteSource } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { useCallback, useMemo, useRef } from 'react';
import { useVariables } from './hooks/use-variables';
import { createVariableExtension } from './variable-plugin';
import { variablePillTheme } from './variable-plugin/variable-theme';
import { VariablePopover } from './variable-popover';
import { cn } from '@/utils/ui';

type CompletionRange = {
  from: number;
  to: number;
};

type ControlInputProps = {
  value: string;
  onChange: (value: string) => void;
  variables: LiquidVariable[];
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'default' | 'lg';
  id?: string;
  multiline?: boolean;
  indentWithTab?: boolean;
};

export function ControlInput({
  value,
  onChange,
  variables,
  placeholder,
  autoFocus,
  size = 'default',
  id,
  multiline = false,
  indentWithTab,
}: ControlInputProps) {
  const viewRef = useRef<EditorView | null>(null);
  const lastCompletionRef = useRef<CompletionRange | null>(null);

  const { selectedVariable, setSelectedVariable, handleVariableSelect, handleVariableUpdate } = useVariables(
    viewRef,
    onChange
  );

  const completionSource = useMemo(() => createAutocompleteSource(variables), [variables]);

  const autocompletionExtension = useMemo(
    () =>
      autocompletion({
        override: [completionSource],
        closeOnBlur: true,
        defaultKeymap: true,
        activateOnTyping: true,
      }),
    [completionSource]
  );

  const variablePluginExtension = useMemo(
    () =>
      createVariableExtension({
        viewRef,
        lastCompletionRef,
        onSelect: handleVariableSelect,
      }),
    [handleVariableSelect]
  );

  const extensions = useMemo(() => {
    const baseExtensions = [...(multiline ? [EditorView.lineWrapping] : []), variablePillTheme];
    return [...baseExtensions, autocompletionExtension, variablePluginExtension];
  }, [autocompletionExtension, variablePluginExtension, multiline]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setTimeout(() => setSelectedVariable(null), 0);
      }
    },
    [setSelectedVariable]
  );

  return (
    <div className="relative">
      <Editor
        fontFamily="inherit"
        multiline={multiline}
        indentWithTab={indentWithTab}
        size={size}
        className={cn('flex-1', { 'overflow-hidden': !multiline })}
        autoFocus={autoFocus}
        placeholder={placeholder}
        id={id}
        extensions={extensions}
        value={value}
        onChange={onChange}
      />
      <Popover open={!!selectedVariable} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        {selectedVariable && <VariablePopover variable={selectedVariable.value} onUpdate={handleVariableUpdate} />}
      </Popover>
    </div>
  );
}
