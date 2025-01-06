import { CreateWorkflowDto } from '@novu/shared';

export interface IWorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  category: 'popular' | 'events' | 'authentication' | 'social';
  workflowDefinition: CreateWorkflowDto;
}
