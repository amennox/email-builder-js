import { describe, expect, it } from 'vitest';

import { classifyWeight, formatKb, htmlWeightBytes, WEIGHT_LIMIT_BYTES, WEIGHT_WARNING_BYTES } from '../htmlWeight';

describe('htmlWeight', () => {
  it('misura i byte reali (UTF-8)', () => {
    expect(htmlWeightBytes('abcd')).toBe(4);
    expect(htmlWeightBytes('è')).toBe(2);
  });

  it('classifica le soglie', () => {
    expect(classifyWeight(10 * 1024)).toBe('ok');
    expect(classifyWeight(WEIGHT_WARNING_BYTES - 1)).toBe('ok');
    expect(classifyWeight(WEIGHT_WARNING_BYTES)).toBe('warning');
    expect(classifyWeight(WEIGHT_LIMIT_BYTES)).toBe('warning');
    expect(classifyWeight(WEIGHT_LIMIT_BYTES + 1)).toBe('over');
  });

  it('formatta in KB', () => {
    expect(formatKb(2048)).toBe('2.0 KB');
    expect(formatKb(51200)).toBe('50 KB');
  });
});
