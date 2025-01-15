import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const paymentFailedTemplate: WorkflowTemplate = {
  id: 'payment-failed',
  name: 'Payment failed alert',
  description: 'Notify users when their payment method fails to process',
  category: 'events',
  isPopular: true,
  workflowDefinition: {
    name: 'Payment failed alert',
    description: 'Notify users when their payment method fails to process',
    workflowId: 'payment-failed',
    steps: [
      {
        name: 'Email Alert',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Action Required: Payment Failed',
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
                  { type: 'text', text: 'We were unable to process your payment of ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.amount', label: null, fallback: null, required: true },
                  },
                  { type: 'text', text: ' for your ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.planName', label: null, fallback: 'subscription', required: false },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Error: ' },
                  {
                    type: 'variable',
                    attrs: {
                      id: 'payload.errorMessage',
                      label: null,
                      fallback: 'Payment processing failed',
                      required: false,
                    },
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'To ensure uninterrupted service, please update your payment information by ' },
                  {
                    type: 'variable',
                    attrs: {
                      id: 'payload.retryDeadline',
                      label: null,
                      fallback: 'as soon as possible',
                      required: false,
                    },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Update Payment Method',
                  isTextVariable: false,
                  url: '{{payload.updatePaymentUrl}}',
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
          subject: 'Payment Failed',
          body: 'We were unable to process your payment of {{payload.amount}}. Please update your payment method.',
          action: {
            status: 'error',
            buttons: [
              {
                content: 'Update Payment',
                buttonColor: '#E53E3E',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
      {
        name: 'SMS Alert',
        type: StepTypeEnum.SMS,
        controlValues: {
          body: 'Payment failed for {{payload.planName}}. Amount: {{payload.amount}}. Please update your payment method to avoid service interruption.',
        },
      },
    ],
    tags: ['billing', 'payment', 'error'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
