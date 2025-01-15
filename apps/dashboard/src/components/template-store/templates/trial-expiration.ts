import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const trialExpirationTemplate: WorkflowTemplate = {
  id: 'trial-expiration',
  name: 'Trial expiration reminder',
  description: 'Notify users when their trial period is about to end',
  category: 'events',
  isPopular: true,
  workflowDefinition: {
    name: 'Trial expiration reminder',
    description: 'Notify users when their trial period is about to end',
    workflowId: 'trial-expiration',
    steps: [
      {
        name: 'Email Notification',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Your trial period ends in {{payload.daysLeft}} days',
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
                  { type: 'text', text: 'Your trial period for ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.productName', label: null, fallback: 'our product', required: false },
                  },
                  { type: 'text', text: ' will end in ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.daysLeft', label: null, fallback: null, required: true },
                  },
                  { type: 'text', text: ' days.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', text: 'During your trial, you have:' }],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                        content: [
                          {
                            type: 'variable',
                            attrs: {
                              id: 'payload.usage.metric1',
                              label: null,
                              fallback: 'Used our features',
                              required: false,
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                        content: [
                          {
                            type: 'variable',
                            attrs: {
                              id: 'payload.usage.metric2',
                              label: null,
                              fallback: 'Explored our platform',
                              required: false,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', text: 'Upgrade now to keep access to all features and your data.' }],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Upgrade Now',
                  isTextVariable: false,
                  url: '{{payload.upgradeUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#0047FF',
                  textColor: '#ffffff',
                  showIfKey: null,
                },
              },
            ],
          }),
        },
      },
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'Trial ends in {{payload.daysLeft}} days',
          body: 'Your trial period will end soon. Upgrade now to keep access to all features.',
          action: {
            buttons: [
              {
                content: 'Upgrade',
                buttonColor: '#0047FF',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
    ],
    tags: ['trial', 'subscription', 'billing'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
