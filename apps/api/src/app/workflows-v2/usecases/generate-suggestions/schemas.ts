import { z } from 'zod';
import { StepTypeEnum } from '@novu/shared';

// Define the base content types
const textNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string(),
  })
  .strict();

const variableNodeSchema = z
  .object({
    type: z.literal('variable'),
    attrs: z
      .object({
        id: z.string(),
        label: z.null(),
        fallback: z.null(),
        required: z.boolean(),
      })
      .strict(),
  })
  .strict();

const paragraphSchema = z
  .object({
    type: z.literal('paragraph'),
    attrs: z
      .object({
        textAlign: z.enum(['left', 'center', 'right']),
      })
      .strict(),
    content: z.array(z.union([textNodeSchema, variableNodeSchema])),
  })
  .strict();

const buttonSchema = z
  .object({
    type: z.literal('button'),
    attrs: z
      .object({
        text: z.string(),
        url: z.string(),
        alignment: z.enum(['left', 'center', 'right']),
        variant: z.enum(['filled', 'outline', 'ghost']),
        borderRadius: z.enum(['none', 'smooth', 'round']),
        buttonColor: z.string(),
        textColor: z.string(),
        showIfKey: z.null(),
      })
      .strict(),
  })
  .strict();

const spacerSchema = z
  .object({
    type: z.literal('spacer'),
    attrs: z
      .object({
        height: z.enum(['sm', 'md', 'lg']),
        showIfKey: z.null(),
      })
      .strict(),
  })
  .strict();

export const emailContentSchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(z.union([paragraphSchema, buttonSchema, spacerSchema])),
  })
  .strict();

// Step schemas
const emailStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.EMAIL),
    name: z.string(),
    subject: z.string(),
    context: z
      .object({
        reasoning: z.string(),
        focus: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const inAppStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.IN_APP),
    name: z.string(),
    subject: z.string(),
    context: z
      .object({
        reasoning: z.string(),
        focus: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const smsStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.SMS),
    name: z.string(),
    subject: z.string(),
    context: z
      .object({
        reasoning: z.string(),
        focus: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const pushStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.PUSH),
    name: z.string(),
    subject: z.string(),
    context: z
      .object({
        reasoning: z.string(),
        focus: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const chatStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.CHAT),
    name: z.string(),
    subject: z.string(),
    context: z
      .object({
        reasoning: z.string(),
        focus: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const delayStepSchema = z
  .object({
    type: z.literal(StepTypeEnum.DELAY),
    name: z.string(),
    metadata: z
      .object({
        amount: z.number(),
        unit: z.enum(['seconds', 'minutes', 'hours', 'days']),
        type: z.enum(['regular', 'scheduled']),
      })
      .strict(),
  })
  .strict();

const stepSchema = z.discriminatedUnion('type', [
  emailStepSchema,
  inAppStepSchema,
  smsStepSchema,
  pushStepSchema,
  chatStepSchema,
  delayStepSchema,
]);

export const workflowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum(['popular', 'events', 'authentication', 'social']),
    steps: z.array(stepSchema),
  })
  .strict();
