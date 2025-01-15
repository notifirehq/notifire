import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const loginAlertTemplate: WorkflowTemplate = {
  id: 'login-alert',
  name: 'New device login',
  description: 'Alert users when a new device signs into their account',
  category: 'authentication',
  isPopular: true,
  workflowDefinition: {
    name: 'New device login',
    description: 'Alert users when a new device signs into their account',
    workflowId: 'login-alert',
    steps: [
      {
        name: 'Email Alert',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'New login detected on your account',
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
                    attrs: { id: 'subscriber.firstName', label: null, fallback: null, required: false },
                  },
                  { type: 'text', text: ',' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'We detected a new login to your account from a ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.deviceType', label: null, fallback: 'new device', required: false },
                  },
                  { type: 'text', text: ' in ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.location', label: null, fallback: 'an unknown location', required: false },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Time: ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.time', label: null, fallback: null, required: true },
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'IP Address: ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.ipAddress', label: null, fallback: 'Unknown', required: false },
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  {
                    type: 'text',
                    text: "If this wasn't you, please secure your account immediately by resetting your password.",
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Reset Password',
                  isTextVariable: false,
                  url: '{{payload.resetPasswordUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#E53E3E',
                  textColor: '#ffffff',
                  showIfKey: null,
                },
              },
            ],
          }),
        },
      },
      {
        name: 'In-App Alert',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'New login from {{payload.location}}',
          body: 'New login detected from {{payload.deviceType}} in {{payload.location}}. Time: {{payload.time}}',
          action: {
            status: 'warning',
            buttons: [
              {
                content: 'Review Activity',
                buttonColor: '#E53E3E',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
    ],
    tags: ['security', 'login', 'authentication'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
