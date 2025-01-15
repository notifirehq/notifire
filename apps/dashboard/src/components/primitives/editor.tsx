import { autocompleteFooter, autocompleteHeader, functionIcon } from '@/components/primitives/constants';
import { useDataRef } from '@/hooks/use-data-ref';
import { tags as t } from '@lezer/highlight';
import createTheme from '@uiw/codemirror-themes';
import { EditorView, ReactCodeMirrorProps, useCodeMirror } from '@uiw/react-codemirror';
import { cva, VariantProps } from 'class-variance-authority';
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const editorVariants = cva('h-full w-full flex-1 [&_.cm-focused]:outline-none', {
  variants: {
    size: {
      default: 'text-xs [&_.cm-editor]:py-1',
      lg: 'text-base [&_.cm-editor]:py-1',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const baseTheme = (options: { multiline?: boolean }) =>
  EditorView.baseTheme({
    '&light': {
      backgroundColor: 'transparent',
    },
    ...(!options.multiline
      ? {
          '.cm-scroller': {
            overflow: 'hidden',
          },
        }
      : {}),
    '.cm-tooltip-autocomplete .cm-completionIcon-variable': {
      '&:before': {
        content: 'Suggestions',
      },
      '&:after': {
        content: "''",
        height: '16px',
        width: '16px',
        display: 'block',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url('${functionIcon}')`,
      },
    },
    '.cm-tooltip-autocomplete.cm-tooltip': {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--neutral-100)',
      backgroundColor: 'hsl(var(--background))',
      boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
      '&:before': {
        content: "''",
        top: '0',
        left: '0',
        right: '0',
        height: '30px',
        display: 'block',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url('${autocompleteHeader}')`,
      },
      '&:after': {
        content: "''",
        bottom: '30px',
        left: '0',
        right: '0',
        height: '30px',
        display: 'block',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url('${autocompleteFooter}')`,
      },
    },
    '.cm-tooltip-autocomplete.cm-tooltip > ul[role="listbox"]': {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      maxHeight: '12rem',
      margin: '4px 0',
      padding: '4px',
    },
    '.cm-tooltip-autocomplete.cm-tooltip > ul > li[role="option"]': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '16px',
      minHeight: '24px',
      color: 'var(--foreground-950)',
      borderRadius: 'calc(var(--radius) - 2px)',
    },
    '.cm-tooltip-autocomplete.cm-tooltip > ul > li[aria-selected="true"]': {
      backgroundColor: 'hsl(var(--neutral-100))',
    },
    '.cm-tooltip-autocomplete.cm-tooltip .cm-completionIcon': {
      padding: '0',
      width: '16px',
      height: '16px',
    },
    '.cm-line span.cm-matchingBracket': {
      backgroundColor: 'hsl(var(--highlighted) / 0.1)',
    },
    'div.cm-content': {
      padding: 0,
    },
    'div.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
      color: 'hsl(var(--foreground-400))',
    },
  });

type EditorProps = {
  value: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  indentWithTab?: boolean;
  height?: string;
  onChange?: (value: string) => void;
  fontFamily?: 'inherit';
} & ReactCodeMirrorProps &
  VariantProps<typeof editorVariants>;

export const Editor = React.forwardRef<{ focus: () => void; blur: () => void }, EditorProps>(
  (
    {
      value,
      placeholder,
      className,
      height,
      size,
      multiline = false,
      fontFamily,
      onChange,
      indentWithTab,
      extensions: extensionsProp,
      basicSetup: basicSetupProp,
      ...restCodeMirrorProps
    },
    ref
  ) => {
    const onChangeRef = useDataRef(onChange);
    const editorRef = useRef<HTMLDivElement>(null);
    const [shouldFocus, setShouldFocus] = useState(false);
    const extensions = useMemo(
      () => [...(extensionsProp ?? []), baseTheme({ multiline })],
      [extensionsProp, multiline]
    );
    const basicSetup = useMemo(
      () => ({
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        defaultKeymap: !multiline,
        ...((typeof basicSetupProp === 'object' ? basicSetupProp : {}) ?? {}),
      }),
      [basicSetupProp, multiline]
    );

    const theme = useMemo(
      () =>
        createTheme({
          theme: 'light',
          styles: [
            { tag: t.keyword, color: 'hsl(var(--feature))' },
            { tag: t.string, color: 'hsl(var(--highlighted))' },
            { tag: t.function(t.variableName), color: 'hsl(var(--information))' },
          ],
          settings: {
            background: 'transparent',
            fontFamily: fontFamily === 'inherit' ? 'inherit' : undefined,
          },
        }),
      [fontFamily]
    );

    const onChangeCallback = useCallback(
      (value: string) => {
        // when typing fast the onChange event is called multiple times during one render phase
        // by default react batches state updates and only triggers one render phase
        // which results in value not being updated and "jumping" effect in the editor
        // to prevent this we need to flush the state updates synchronously
        flushSync(() => {
          onChangeRef.current?.(value);
        });
      },
      [onChangeRef]
    );

    const { setContainer, view } = useCodeMirror({
      extensions,
      height,
      placeholder,
      basicSetup,
      container: editorRef.current,
      indentWithTab,
      value,
      onChange: onChangeCallback,
      theme,
      ...restCodeMirrorProps,
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => setShouldFocus(true),
        blur: () => setShouldFocus(false),
      }),
      []
    );

    useEffect(() => {
      if (editorRef.current) {
        setContainer(editorRef.current);
      }
    }, [setContainer]);

    useLayoutEffect(() => {
      if (view && shouldFocus) {
        view.focus();
        setShouldFocus(false);
      }
    }, [shouldFocus, view]);

    return <div ref={editorRef} className={editorVariants({ size, className })} />;
  }
);
