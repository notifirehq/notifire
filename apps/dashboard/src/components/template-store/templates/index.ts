import { loginAlertTemplate } from './login-alert';
import { mentionNotificationTemplate } from './mention-notification';
import { paymentFailedTemplate } from './payment-failed';
import { teamInvitationTemplate } from './team-invitation';
import { trialExpirationTemplate } from './trial-expiration';
import { usageLimitTemplate } from './usage-limit';
import { passwordResetTemplate } from './password-reset';
import { newCommentTemplate } from './new-comment';
import { orderConfirmationTemplate } from './order-confirmation';
import { WorkflowTemplate } from './types';

export function getTemplates(): WorkflowTemplate[] {
  return [
    mentionNotificationTemplate,
    loginAlertTemplate,
    trialExpirationTemplate,
    paymentFailedTemplate,
    teamInvitationTemplate,
    usageLimitTemplate,
    passwordResetTemplate,
    newCommentTemplate,
    orderConfirmationTemplate,
  ];
}

export * from './types';
