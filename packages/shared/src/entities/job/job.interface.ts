import { type EnvironmentId, type ITenantDefine, type OrganizationId, type StepTypeEnum } from '../../types';
import { type IWorkflowStepMetadata } from '../step';
import { type JobStatusEnum } from './status.enum';
import { type INotificationTemplateStep } from '../notification-template';

export interface IJob {
  _id: string;
  identifier: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;

  overrides: Record<string, Record<string, unknown>>;
  step: INotificationTemplateStep;
  tenant?: ITenantDefine;
  transactionId: string;
  _notificationId: string;
  subscriberId: string;
  _subscriberId: string;
  _environmentId: EnvironmentId;
  _organizationId: OrganizationId;
  providerId?: string;
  _userId: string;
  delay?: number;
  _parentId?: string;
  status: JobStatusEnum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  createdAt: string;
  updatedAt: string;
  _templateId: string;
  digest?: IWorkflowStepMetadata & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events?: any[];
  };
  type?: StepTypeEnum;
  _actorId?: string;
}
