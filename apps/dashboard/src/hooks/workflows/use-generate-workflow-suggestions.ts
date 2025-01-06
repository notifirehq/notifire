import { useMutation } from '@tanstack/react-query';
import { generateWorkflowSuggestions } from '@/api/workflows';
import { WorkflowMode } from '@/components/template-store/types';
import { useEnvironment } from '../../context/environment/hooks';

export function useGenerateWorkflowSuggestions() {
  const { currentEnvironment } = useEnvironment();

  return useMutation({
    mutationFn: async ({ prompt, mode }: { prompt: string; mode: WorkflowMode }) =>
      generateWorkflowSuggestions({
        environment: currentEnvironment!,
        prompt,
        mode: mode === WorkflowMode.FROM_PROMPT ? 'single' : 'multiple',
      }),
  });
}
