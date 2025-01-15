import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const mentionNotificationTemplate: WorkflowTemplate = {
  id: 'mention-notification',
  name: 'Mention in a comment',
  description: 'Triggered when an actor mentions someone',
  category: 'social',
  isPopular: true,
  workflowDefinition: {
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    workflowId: 'mention-notification',
    steps: [
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          body: 'You were mentioned in a comment by {{payload.actorName}}',
          avatar: '',
          subject: 'New Mention',
          primaryAction: {
            label: 'View Comment',
            redirect: {
              url: '{{payload.commentUrl}}',
              target: '_blank',
            },
          },
          secondaryAction: null,
          redirect: {
            url: '',
            target: '_self',
          },
        },
      },
      {
        name: 'Email Notification',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'You were mentioned in a comment',
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
                  { type: 'text', text: 'You were mentioned in a comment by ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.actorName', label: null, fallback: null, required: false },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'View Comment',
                  isTextVariable: false,
                  url: '',
                  isUrlVariable: false,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#000000',
                  textColor: '#ffffff',
                  showIfKey: null,
                },
              },
            ],
          }),
        },
      },
    ],
    tags: ['mention', 'comment', 'notification'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
