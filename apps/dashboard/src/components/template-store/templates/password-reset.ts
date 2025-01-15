import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const passwordResetTemplate: WorkflowTemplate = {
  id: 'password-reset',
  name: 'Password Reset Flow',
  description: 'Send a secure password reset link to users',
  category: 'authentication',
  isPopular: true,
  workflowDefinition: {
    name: 'Password Reset Flow',
    description: 'Send a secure password reset link to users',
    workflowId: 'password-reset',
    steps: [
      {
        name: 'Email Notification',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Reset Your Password',
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Hi ' },
                  {
                    type: 'variable',
                    attrs: { id: 'subscriber.firstName', label: null, fallback: 'there', required: false },
                  },
                  { type: 'text', text: ',' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  {
                    type: 'text',
                    text: 'We received a request to reset your password. If you did not make this request, please ignore this email.',
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  {
                    type: 'text',
                    text: 'To reset your password, click the button below. This link will expire in 1 hour.',
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Reset Password',
                  isTextVariable: false,
                  url: '{{payload.resetUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#0047FF',
                  textColor: '#ffffff',
                },
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'If the button does not work, copy and paste this link into your browser:' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  {
                    type: 'variable',
                    attrs: {
                      id: 'payload.resetUrl',
                      label: null,
                      fallback: 'https://example.com/reset',
                      required: true,
                    },
                  },
                ],
              },
            ],
          }),
        },
      },
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'Password Reset Requested',
          body: 'A password reset was requested for your account. Check your email for instructions.',
        },
      },
    ],
    tags: ['security', 'authentication', 'password'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
