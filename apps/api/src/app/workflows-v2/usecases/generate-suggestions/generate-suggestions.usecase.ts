import { openai } from '@ai-sdk/openai';
import { Injectable, Logger } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';
import { generateObject } from 'ai';
import { z } from 'zod';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand, WorkflowModeEnum } from './generate-suggestions.command';
import { mapSuggestionToDto } from './mappers';
import { prompts } from './prompts';
import { withRetry } from './retry.util';
import { emailContentSchema, workflowSchema } from './schemas';
import { IEmailContent, IWorkflow, IWorkflowStep } from './types';

interface IGeneratedTextContent {
  text: string;
}

type GeneratedContent = { type: 'doc'; content: IEmailContent[] } | IGeneratedTextContent;

type ContentGenerator = {
  prompt: string;
  schema: z.ZodType<GeneratedContent>;
  mapResult: (result: GeneratedContent) => string;
} | null;

@Injectable()
export class GenerateSuggestionsUsecase {
  private readonly logger = new Logger(GenerateSuggestionsUsecase.name);

  private readonly contentGenerators: Record<StepTypeEnum, ContentGenerator> = {
    [StepTypeEnum.EMAIL]: {
      prompt: prompts.email,
      schema: emailContentSchema as z.ZodType<{ type: 'doc'; content: IEmailContent[] }>,
      mapResult: (result: { type: 'doc'; content: IEmailContent[] }) => JSON.stringify(result.content[0]),
    },
    [StepTypeEnum.IN_APP]: {
      prompt: prompts.inApp,
      schema: z.object({ text: z.string() }) as z.ZodType<IGeneratedTextContent>,
      mapResult: (result: IGeneratedTextContent) => result.text,
    },
    [StepTypeEnum.PUSH]: {
      prompt: prompts.push,
      schema: z.object({ text: z.string() }) as z.ZodType<IGeneratedTextContent>,
      mapResult: (result: IGeneratedTextContent) => result.text,
    },
    [StepTypeEnum.SMS]: {
      prompt: prompts.sms,
      schema: z.object({ text: z.string() }) as z.ZodType<IGeneratedTextContent>,
      mapResult: (result: IGeneratedTextContent) => result.text,
    },
    [StepTypeEnum.CHAT]: {
      prompt: prompts.chat,
      schema: z.object({ text: z.string() }) as z.ZodType<IGeneratedTextContent>,
      mapResult: (result: IGeneratedTextContent) => result.text,
    },
    // Non-content steps return null
    [StepTypeEnum.DIGEST]: null,
    [StepTypeEnum.TRIGGER]: null,
    [StepTypeEnum.DELAY]: null,
    [StepTypeEnum.CUSTOM]: null,
  };

  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const workflowsResult = await this.generateWorkflowStructures(command);
    const enrichedWorkflows = await this.enrichWorkflowsWithContent(workflowsResult.suggestions, command);

    return {
      suggestions: enrichedWorkflows.map(mapSuggestionToDto),
    };
  }

  private async generateWorkflowStructures(command: GenerateSuggestionsCommand) {
    const workflowPrompt =
      command.mode === WorkflowModeEnum.SINGLE ? prompts.singleWorkflow : prompts.multipleWorkflows;

    return withRetry(
      async () => {
        const result = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${workflowPrompt}

User's request: ${command.prompt}`,
          schema: z.object({ suggestions: z.array(workflowSchema) }),
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return result.object;
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying workflow structure generation after ${delay}ms (attempt ${attempt})`, {
            error,
            command,
          });
        },
      }
    );
  }

  private async enrichWorkflowsWithContent(workflows: IWorkflow[], command: GenerateSuggestionsCommand) {
    return Promise.all(
      workflows.map(async (workflow) => ({
        ...workflow,
        steps: await Promise.all(
          workflow.steps?.map(async (step) => ({
            ...step,
            body: await this.generateStepContent(workflow, step, command),
          })) ?? []
        ),
      }))
    );
  }

  private async generateStepContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    const generator = this.contentGenerators[step.type];
    if (!generator) return step.body;

    const result = await withRetry(
      async () => {
        const response = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: this.buildContentPrompt(generator.prompt, workflow, step, command),
          schema: generator.schema,
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return generator.mapResult(response.object);
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying ${step.type} content generation after ${delay}ms (attempt ${attempt})`, {
            error,
            workflow,
            step,
          });
        },
      }
    );

    return result;
  }

  private buildContentPrompt(
    basePrompt: string,
    workflow: IWorkflow,
    step: IWorkflowStep,
    command: GenerateSuggestionsCommand
  ): string {
    return `${basePrompt}

Workflow Context:
Name: ${workflow.name}
Description: ${workflow.description}
Step Name: ${step.name}
Step Reasoning: ${step.context?.reasoning || ''}
Step Focus Points:
${step.context?.focus?.map((point) => `- ${point}`).join('\n') || ''}

User's request: ${command.prompt}`;
  }

  private isRetryableError(error: unknown): boolean {
    // Zod validation errors (can be transient due to AI output variations)
    if (error instanceof z.ZodError) return true;

    // Rate limits
    if (error && typeof error === 'object' && 'status' in error) {
      const { status } = error as { status: number };
      if (status === 429) return true;
      // Server errors
      if (status >= 500 && status < 600) return true;
    }

    // Network errors
    if (error && typeof error === 'object' && 'code' in error) {
      const { code } = error as { code: string };
      if (code === 'ECONNRESET' || code === 'ETIMEDOUT') return true;
    }

    // Specific OpenAI errors that are retryable
    const retryableMessages = ['capacity', 'server_error', 'rate_limit_exceeded', 'model_overloaded'];

    if (error && typeof error === 'object' && 'message' in error) {
      const { message } = error as { message: string };

      return retryableMessages.some((msg) => message.toLowerCase().includes(msg));
    }

    return false;
  }
}
