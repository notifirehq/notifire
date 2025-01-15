import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const teamInvitationTemplate: WorkflowTemplate = {
  id: 'team-invitation',
  name: 'Team member invitation',
  description: 'Send invitations to new team members',
  category: 'social',
  isPopular: true,
  workflowDefinition: {
    name: 'Team member invitation',
    description: 'Send invitations to new team members',
    workflowId: 'team-invitation',
    steps: [
      {
        name: 'Email Invitation',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: '{{payload.inviterName}} invited you to join {{payload.organizationName}}',
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
                    type: 'variable',
                    attrs: { id: 'payload.inviterName', label: null, fallback: 'Someone', required: false },
                  },
                  { type: 'text', text: ' has invited you to join ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.organizationName', label: null, fallback: 'their team', required: false },
                  },
                  { type: 'text', text: ' as a ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.role', label: null, fallback: 'team member', required: false },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Message from ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.inviterName', label: null, fallback: 'the inviter', required: false },
                  },
                  { type: 'text', text: ':' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  {
                    type: 'variable',
                    attrs: { id: 'payload.message', label: null, fallback: 'Join our team!', required: false },
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Accept Invitation',
                  isTextVariable: false,
                  url: '{{payload.invitationUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#0047FF',
                  textColor: '#ffffff',
                  showIfKey: null,
                },
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'This invitation will expire in ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.expirationTime', label: null, fallback: '24 hours', required: false },
                  },
                  { type: 'text', text: '.' },
                ],
              },
            ],
          }),
        },
      },
      {
        name: 'SMS Notification',
        type: StepTypeEnum.SMS,
        controlValues: {
          body: '{{payload.inviterName}} invited you to join {{payload.organizationName}}. Click {{payload.invitationUrl}} to accept.',
        },
      },
    ],
    tags: ['team', 'invitation', 'onboarding'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
