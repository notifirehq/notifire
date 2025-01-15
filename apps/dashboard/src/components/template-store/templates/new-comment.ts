import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const newCommentTemplate: WorkflowTemplate = {
  id: 'new-comment',
  name: 'New Comment Notification',
  description: 'Notify users when someone comments on their content',
  category: 'social',
  isPopular: true,
  workflowDefinition: {
    name: 'New Comment Notification',
    description: 'Notify users when someone comments on their content',
    workflowId: 'new-comment',
    steps: [
      {
        name: 'Push Notification',
        type: StepTypeEnum.PUSH,
        controlValues: {
          subject: '{{payload.commenterName}} commented on your post',
          body: '{{payload.commentText}}',
        },
      },
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'New comment on your post',
          body: '{{payload.commenterName}} commented: "{{payload.commentText}}"',
          action: {
            buttons: [
              {
                content: 'View Comment',
                buttonColor: '#0047FF',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
      {
        name: 'Email Digest',
        type: StepTypeEnum.DIGEST,
        controlValues: {
          digestKey: 'postId',
          digestMetadata: {
            type: 'comments',
            amount: '{{step.total_count}}',
          },
          unit: 'hours',
          amount: 24,
          backoff: false,
          backoffAmount: 1,
          backoffUnit: 'hours',
          timed: {
            atTime: '00:00',
          },
        },
      },
      {
        name: 'Daily Comment Summary',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Your post received {{step.total_count}} new comments today',
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
                  { type: 'text', text: 'Your post "' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.postTitle', label: null, fallback: 'your content', required: false },
                  },
                  { type: 'text', text: '" received ' },
                  {
                    type: 'variable',
                    attrs: { id: 'step.total_count', label: null, fallback: '0', required: true },
                  },
                  { type: 'text', text: ' new comments today.' },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'View Comments',
                  isTextVariable: false,
                  url: '{{payload.postUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#0047FF',
                  textColor: '#ffffff',
                },
              },
            ],
          }),
        },
      },
    ],
    tags: ['social', 'engagement', 'comments'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
