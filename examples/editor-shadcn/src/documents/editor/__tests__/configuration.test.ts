import { renderToStaticMarkup } from '../../../email';
import { describe, expect, it } from 'vitest';

import EMPTY_EMAIL_MESSAGE from '../../../getConfiguration/sample/empty-email-message';
import HOTEL_POST_STAY from '../../../getConfiguration/sample/hotel-post-stay';
import HOTEL_PRE_STAY from '../../../getConfiguration/sample/hotel-pre-stay';
import ONE_TIME_PASSCODE from '../../../getConfiguration/sample/one-time-passcode';
import ORDER_ECOMMERCE from '../../../getConfiguration/sample/order-ecommerce';
import POST_METRICS_REPORT from '../../../getConfiguration/sample/post-metrics-report';
import RESERVATION_REMINDER from '../../../getConfiguration/sample/reservation-reminder';
import RESET_PASSWORD from '../../../getConfiguration/sample/reset-password';
import RESPOND_TO_MESSAGE from '../../../getConfiguration/sample/respond-to-message';
import SUBSCRIPTION_RECEIPT from '../../../getConfiguration/sample/subscription-receipt';
import WELCOME from '../../../getConfiguration/sample/welcome';
import { EditorConfigurationSchema } from '../core';
import validateJsonStringValue from '../validateJsonStringValue';

const SAMPLES = {
  'empty-email-message': EMPTY_EMAIL_MESSAGE,
  'hotel-pre-stay': HOTEL_PRE_STAY,
  'hotel-post-stay': HOTEL_POST_STAY,
  'one-time-passcode': ONE_TIME_PASSCODE,
  'order-ecommerce': ORDER_ECOMMERCE,
  'post-metrics-report': POST_METRICS_REPORT,
  'reservation-reminder': RESERVATION_REMINDER,
  'reset-password': RESET_PASSWORD,
  'respond-to-message': RESPOND_TO_MESSAGE,
  'subscription-receipt': SUBSCRIPTION_RECEIPT,
  welcome: WELCOME,
} as const;

describe('sample templates', () => {
  for (const [name, sample] of Object.entries(SAMPLES)) {
    it(`"${name}" ha un blocco root e valida con zod`, () => {
      expect(sample.root).toBeDefined();
      const result = EditorConfigurationSchema.safeParse(sample);
      expect(result.success).toBe(true);
    });

    it(`"${name}" produce HTML non vuoto con renderToStaticMarkup`, () => {
      const html = renderToStaticMarkup(sample, { rootBlockId: 'root' });
      expect(html.length).toBeGreaterThan(100);
      expect(html).toContain('<!DOCTYPE html');
    });
  }
});

describe('validateJsonStringValue', () => {
  it('rifiuta JSON malformato', () => {
    expect(validateJsonStringValue('{not json').error).toBe('Invalid json');
  });

  it('rifiuta documenti senza nodo root', () => {
    expect(validateJsonStringValue('{}').error).toBe('Missing "root" node');
  });

  it('accetta un sample valido (round-trip)', () => {
    const { data, error } = validateJsonStringValue(JSON.stringify(WELCOME));
    expect(error).toBeUndefined();
    expect(data).toEqual(WELCOME);
  });
});
