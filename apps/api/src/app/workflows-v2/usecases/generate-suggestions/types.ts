import { StepTypeEnum } from '@novu/shared';

export type ContentType =
  | 'text'
  | 'variable'
  | 'paragraph'
  | 'button'
  | 'horizontalRule'
  | 'spacer'
  | 'columns'
  | 'column';

export interface IEmailContent {
  type: ContentType;
  text?: string;
  attrs?: {
    textAlign?: 'left' | 'center' | 'right';
    id?: string;
    label?: null;
    fallback?: null;
    required?: boolean;
    text?: string;
    isTextVariable?: boolean;
    url?: string;
    isUrlVariable?: boolean;
    alignment?: 'left' | 'center' | 'right';
    variant?: 'filled' | 'outline' | 'ghost';
    borderRadius?: 'none' | 'smooth' | 'round';
    buttonColor?: string;
    textColor?: string;
    showIfKey?: string | null;
    height?: 'sm' | 'md' | 'lg';
    gap?: number;
    columnId?: string;
    width?: string;
    verticalAlign?: 'top' | 'middle' | 'bottom';
  };
  content?: IEmailContent[];
}

export interface IWorkflowStep {
  type: StepTypeEnum;
  name: string;
  subject?: string;
  body?: string;
  content?: IEmailContent[];
  metadata?: {
    amount: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
    type: 'regular' | 'scheduled';
  };
  context?: {
    reasoning: string;
    focus: string[];
  };
}

export interface IWorkflow {
  id?: string;
  name?: string;
  description?: string;
  category?: 'popular' | 'events' | 'authentication' | 'social';
  steps?: IWorkflowStep[];
}
