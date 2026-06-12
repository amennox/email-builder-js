import { describe, expect, it } from 'vitest';

import { TEditorConfiguration } from '../../documents/editor/core';
import { contrastRatio, runPreflight } from '../preflight';

const DEFECTIVE_DOC = {
  root: {
    type: 'EmailLayout',
    data: { canvasColor: '#FFFFFF', textColor: '#242424', childrenIds: ['img', 'btn', 'txt', 'okTxt'] },
  },
  img: { type: 'Image', data: { props: { url: 'https://example.com/a.png', alt: '' } } },
  btn: {
    type: 'Button',
    data: { props: { text: 'Click', url: '#', buttonTextColor: '#FFFFFF', buttonBackgroundColor: '#FFFF99' } },
  },
  txt: { type: 'Text', data: { style: { color: '#CCCCCC' }, props: { text: 'poco leggibile' } } },
  okTxt: { type: 'Text', data: { props: { text: 'testo ok' } } },
} as unknown as TEditorConfiguration;

describe('contrastRatio', () => {
  it('nero su bianco = 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });
  it('colore invalido → null', () => {
    expect(contrastRatio('red', '#FFFFFF')).toBeNull();
  });
});

describe('runPreflight', () => {
  const issues = runPreflight(DEFECTIVE_DOC, '<html></html>');

  it('rileva alt mancante', () => {
    expect(issues.some((i) => i.rule === 'missing-alt' && i.blockId === 'img')).toBe(true);
  });

  it('rileva href vuoto/#', () => {
    expect(issues.some((i) => i.rule === 'empty-href' && i.blockId === 'btn')).toBe(true);
  });

  it('rileva contrasto insufficiente su testo e bottone', () => {
    expect(issues.some((i) => i.rule === 'low-contrast' && i.blockId === 'txt')).toBe(true);
    expect(issues.some((i) => i.rule === 'low-contrast' && i.blockId === 'btn')).toBe(true);
  });

  it('non segnala il testo con contrasto adeguato', () => {
    expect(issues.some((i) => i.blockId === 'okTxt')).toBe(false);
  });

  it('rileva HTML oltre soglia', () => {
    const big = runPreflight(DEFECTIVE_DOC, 'x'.repeat(101 * 1024));
    expect(big.some((i) => i.rule === 'overweight')).toBe(true);
    expect(issues.some((i) => i.rule === 'overweight')).toBe(false);
  });
});
