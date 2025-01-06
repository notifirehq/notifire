import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { Textarea } from '@/components/primitives/textarea';
import { useEnvironment } from '@/context/environment/hooks';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { postV2 } from '@/api/api.client';
import { IWorkflowSuggestion } from './templates/types';

const PROMPT_EXAMPLES = [
  "We're building a marketplace platform connecting freelancers with clients",
  'We have an e-commerce store selling fashion products',
  "We're developing an online learning platform for students and teachers",
  "We're creating a SaaS analytics dashboard for businesses",
  'We have a mobile app for food delivery services',
] as const;

type WorkflowGenerateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionsGenerated?: (suggestions: IWorkflowSuggestion[]) => void;
};

export function WorkflowGenerateModal({ open, onOpenChange, onSuggestionsGenerated }: WorkflowGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<IWorkflowSuggestion[]>([]);
  const { currentEnvironment } = useEnvironment();

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      const { data } = await postV2<{ data: { suggestions: IWorkflowSuggestion[] } }>('/workflows/suggestions', {
        environment: currentEnvironment!,
        body: { prompt },
      });
      setSuggestions(data.suggestions);
      onSuggestionsGenerated?.(data.suggestions);
    } catch (error) {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to generate suggestions:{' '}
              {error instanceof Error ? error.message : 'There was an error generating workflow suggestions.'}
            </span>
          </>
        ),
        options: {
          position: 'bottom-right',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Workflow Suggestions</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">Describe your product and we'll suggest relevant workflows</p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., We're building a SaaS project management tool..."
              className="min-h-[100px]"
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500">Try these examples:</span>
              <div className="flex flex-wrap gap-2">
                {PROMPT_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="h-px bg-gray-100" />
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium">Generated Suggestions</h3>
                <div className="grid gap-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <h4 className="mb-1 font-medium">{suggestion.name}</h4>
                      <p className="text-sm text-gray-500">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Generate Suggestions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
