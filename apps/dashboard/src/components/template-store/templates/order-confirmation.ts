import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const orderConfirmationTemplate: WorkflowTemplate = {
  id: 'order-confirmation',
  name: 'Order Confirmation',
  description: 'Send order confirmation and tracking details to customers',
  category: 'events',
  isPopular: true,
  workflowDefinition: {
    name: 'Order Confirmation',
    description: 'Send order confirmation and tracking details to customers',
    workflowId: 'order-confirmation',
    steps: [
      {
        name: 'Email Confirmation',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Order Confirmed - #{{payload.orderId}}',
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
                    text: "Thank you for your order! We're pleased to confirm that we've received your order #",
                  },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.orderId', label: null, fallback: '0000', required: true },
                  },
                  { type: 'text', text: '.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', text: 'Order Details:' }],
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
                          { type: 'text', text: 'Order Total: ' },
                          {
                            type: 'variable',
                            attrs: { id: 'payload.orderTotal', label: null, fallback: '$0.00', required: true },
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
                          { type: 'text', text: 'Estimated Delivery: ' },
                          {
                            type: 'variable',
                            attrs: { id: 'payload.estimatedDelivery', label: null, fallback: 'TBD', required: false },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Track Order',
                  isTextVariable: false,
                  url: '{{payload.trackingUrl}}',
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
      {
        name: 'SMS Notification',
        type: StepTypeEnum.SMS,
        controlValues: {
          body: 'Your order #{{payload.orderId}} is confirmed! Track your order here: {{payload.trackingUrl}}',
        },
      },
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'Order #{{payload.orderId}} Confirmed',
          body: 'Thank you for your order! Track your delivery status here.',
          action: {
            buttons: [
              {
                content: 'Track Order',
                buttonColor: '#0047FF',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
    ],
    tags: ['orders', 'tracking'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
