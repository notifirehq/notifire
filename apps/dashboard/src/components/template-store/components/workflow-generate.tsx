import { Button } from '@/components/primitives/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/primitives/hover-card';
import { Input, InputField } from '@/components/primitives/input';
import { Textarea } from '@/components/primitives/textarea';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { FROM_PROMPT_EXAMPLES, GENERATE_EXAMPLES } from '../constants';
import { IWorkflowSuggestion } from '../templates';
import { WorkflowMode } from '../types';
import { LoadingSkeleton } from './loading-skeleton';
import { WorkflowResults } from './workflow-results';

export type WorkflowGenerateProps = {
  mode: WorkflowMode;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  handleSubmit: () => void;
  suggestions: IWorkflowSuggestion[];
  onClick: (template: IWorkflowSuggestion) => void;
};

export function WorkflowGenerate({
  mode,
  prompt,
  setPrompt,
  isGenerating,
  handleSubmit,
  suggestions,
  onClick,
}: WorkflowGenerateProps) {
  const examples = mode === 'from_prompt' ? FROM_PROMPT_EXAMPLES : GENERATE_EXAMPLES;

  if (isGenerating) {
    return <LoadingSkeleton />;
  }

  if (suggestions.length > 0) {
    return (
      <>
        <div className="mb-3 flex items-center gap-3">
          <InputField>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-xs"
              placeholder="Describe your workflow..."
              disabled={isGenerating}
            />
          </InputField>
          <Button onClick={handleSubmit} size="sm" type="button" isLoading={isGenerating}>
            Regenerate
          </Button>
        </div>
        <WorkflowResults mode={mode} suggestions={suggestions} onClick={onClick} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
          {mode === 'from_prompt' ? (
            <Wand2 className="text-primary h-6 w-6" />
          ) : (
            <Sparkles className="text-primary h-6 w-6" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'from_prompt' ? 'Generate from a prompt' : 'Create AI suggestions'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'from_prompt'
              ? 'Describe your workflow, and our AI will create it instantly'
              : 'Describe your product, and our AI will craft personalized notification workflows tailored to your needs'}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'from_prompt'
              ? 'e.g., Send a welcome email when a user signs up, followed by an in-app message after 24 hours...'
              : "e.g., We're building a SaaS project management tool..."
          }
          className="min-h-[120px] text-sm"
        />
      </div>

      <div className="flex w-full max-w-xl flex-col gap-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">Try these examples</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <HoverCard key={example.prompt} openDelay={500}>
                <HoverCardTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={() => setPrompt(example.prompt)}
                    className="group relative flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-left text-xs text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="rounded-md bg-gray-100 p-1">
                      {mode === 'from_prompt' ? (
                        <Wand2 className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                    <span>{example.concept}</span>
                  </motion.button>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" align="start" className="w-64 p-2 text-xs" sideOffset={5}>
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-gray-100 p-1">
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                    </div>
                    <p className="text-gray-600">{example.prompt}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} size="sm" className="w-full max-w-xl" type="button" isLoading={isGenerating}>
        {mode === 'from_prompt' ? 'Generate Workflow' : 'Generate Suggestions'}
      </Button>
    </div>
  );
}
