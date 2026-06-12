import { TEditorConfiguration } from '../documents/editor/core';
import EMPTY_EMAIL_MESSAGE from '../getConfiguration/sample/empty-email-message';
import ONE_TIME_PASSCODE from '../getConfiguration/sample/one-time-passcode';
import ORDER_ECOMMERCE from '../getConfiguration/sample/order-ecommerce';
import POST_METRICS_REPORT from '../getConfiguration/sample/post-metrics-report';
import RESERVATION_REMINDER from '../getConfiguration/sample/reservation-reminder';
import RESET_PASSWORD from '../getConfiguration/sample/reset-password';
import RESPOND_TO_MESSAGE from '../getConfiguration/sample/respond-to-message';
import SUBSCRIPTION_RECEIPT from '../getConfiguration/sample/subscription-receipt';
import WELCOME from '../getConfiguration/sample/welcome';

export type TPrefabTemplate = {
  id: string;
  name: string;
  document: TEditorConfiguration;
};

export const PREFAB_TEMPLATES: TPrefabTemplate[] = [
  { id: 'empty', name: 'Empty', document: EMPTY_EMAIL_MESSAGE },
  { id: 'welcome', name: 'Welcome email', document: WELCOME },
  { id: 'one-time-password', name: 'One-time passcode (OTP)', document: ONE_TIME_PASSCODE },
  { id: 'reset-password', name: 'Reset password', document: RESET_PASSWORD },
  { id: 'order-ecomerce', name: 'E-commerce receipt', document: ORDER_ECOMMERCE },
  { id: 'subscription-receipt', name: 'Subscription receipt', document: SUBSCRIPTION_RECEIPT },
  { id: 'reservation-reminder', name: 'Reservation reminder', document: RESERVATION_REMINDER },
  { id: 'post-metrics-report', name: 'Post metrics', document: POST_METRICS_REPORT },
  { id: 'respond-to-message', name: 'Respond to inquiry', document: RESPOND_TO_MESSAGE },
];

export function getPrefab(id: string): TPrefabTemplate | undefined {
  return PREFAB_TEMPLATES.find((p) => p.id === id);
}
