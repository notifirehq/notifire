import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { parseStepVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { cn } from '@/utils/ui';
import { Editor } from '@maily-to/core';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { HTMLAttributes, useMemo, useState } from 'react';
import { DEFAULT_EDITOR_CONFIG, getEditorBlocks } from './maily-config';

type MailyProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
};

export const Maily = ({ value, onChange, className, ...rest }: MailyProps) => {
  const { step } = useWorkflow();
  const mailyVariables = useMemo(
    () => (step ? parseStepVariables(step.variables) : { primitives: [], arrays: [], namespaces: [] }),
    [step]
  );
  const primitives = useMemo(
    () => mailyVariables.primitives.map((v) => ({ name: v.label, required: false })),
    [mailyVariables.primitives]
  );
  const arrays = useMemo(
    () => mailyVariables.arrays.map((v) => ({ name: v.label, required: false })),
    [mailyVariables.arrays]
  );
  const namespaces = useMemo(
    () => mailyVariables.namespaces.map((v) => ({ name: v.label, required: false })),
    [mailyVariables.namespaces]
  );

  const [_, setEditor] = useState<TiptapEditor>();

  const isForBlockEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_ND_EMAIL_FOR_BLOCK_ENABLED);
  const isShowEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_ND_EMAIL_SHOW_ENABLED);

  return (
    <>
      {!isShowEnabled && (
        <style>{`
                  button:has(.lucide-eye) {
                    display: none;
                  }
                `}</style>
      )}
      <div className={cn('mx-auto flex h-full flex-col items-start', className)} {...rest}>
        <Editor
          key={isForBlockEnabled ? 'for-block-enabled' : 'for-block-disabled'}
          config={DEFAULT_EDITOR_CONFIG}
          blocks={getEditorBlocks(isForBlockEnabled)}
          variableTriggerCharacter="{{"
          variables={({ query, editor, from }) => {
            const queryWithoutSuffix = query.replace(/}+$/, '');
            const filteredVariables: { name: string; required: boolean }[] = [];

            function addInlineVariable() {
              if (!query.endsWith('}}')) {
                return;
              }
              if (filteredVariables.every((variable) => variable.name !== queryWithoutSuffix)) {
                return;
              }
              const from = editor?.state.selection.from - queryWithoutSuffix.length - 4; /* for prefix */
              const to = editor?.state.selection.from;

              editor?.commands.deleteRange({ from, to });
              editor?.commands.insertContent({
                type: 'variable',
                attrs: {
                  id: queryWithoutSuffix,
                  label: null,
                  fallback: null,
                  showIfKey: null,
                  required: false,
                },
              });
            }

            if (from === 'for-variable') {
              filteredVariables.push(...arrays, ...namespaces);
              if (namespaces.some((namespace) => queryWithoutSuffix.includes(namespace.name))) {
                filteredVariables.push({ name: queryWithoutSuffix, required: false });
              }

              addInlineVariable();
              return dedupAndSortVariables(filteredVariables, queryWithoutSuffix);
            }

            const iterableName = editor?.getAttributes('for')?.each;

            const newNamespaces = [...namespaces, ...(iterableName ? [{ name: iterableName, required: false }] : [])];

            filteredVariables.push(...primitives, ...newNamespaces);
            if (newNamespaces.some((namespace) => queryWithoutSuffix.includes(namespace.name))) {
              filteredVariables.push({ name: queryWithoutSuffix, required: false });
            }

            if (from === 'content-variable') {
              addInlineVariable();
            }
            return dedupAndSortVariables(filteredVariables, queryWithoutSuffix);
          }}
          contentJson={value ? JSON.parse(value) : undefined}
          onCreate={setEditor}
          onUpdate={(editor) => {
            setEditor(editor);

            if (onChange) {
              onChange(JSON.stringify(editor.getJSON()));
            }
          }}
        />
      </div>
    </>
  );
};

const dedupAndSortVariables = (
  variables: { name: string; required: boolean }[],
  query: string
): { name: string; required: boolean }[] => {
  // Filter variables that match the query
  const filteredVariables = variables.filter((variable) => variable.name.toLowerCase().includes(query.toLowerCase()));

  // Deduplicate based on name property
  const uniqueVariables = Array.from(new Map(filteredVariables.map((item) => [item.name, item])).values());

  // Sort variables: exact matches first, then starts with query, then alphabetically
  return uniqueVariables.sort((a, b) => {
    const aExactMatch = a.name.toLowerCase() === query.toLowerCase();
    const bExactMatch = b.name.toLowerCase() === query.toLowerCase();
    const aStartsWithQuery = a.name.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWithQuery = b.name.toLowerCase().startsWith(query.toLowerCase());

    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;

    return a.name.localeCompare(b.name);
  });
};
