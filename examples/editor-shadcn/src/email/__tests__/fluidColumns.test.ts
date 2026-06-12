import { describe, expect, it } from 'vitest';

import { renderToStaticMarkup } from '..';
import { TEditorConfiguration } from '../../documents/editor/core';

function docWith(props: Record<string, unknown>): TEditorConfiguration {
  return {
    root: { type: 'EmailLayout', data: { childrenIds: ['cols'] } },
    cols: {
      type: 'ColumnsContainer',
      data: {
        style: { padding: { top: 0, bottom: 0, left: 24, right: 24 } },
        props: {
          columnsCount: 2,
          columns: [{ childrenIds: ['a'] }, { childrenIds: ['b'] }, { childrenIds: [] }],
          ...props,
        },
      },
    },
    a: { type: 'Text', data: { props: { text: 'COL-A' } } },
    b: { type: 'Text', data: { props: { text: 'COL-B' } } },
  } as TEditorConfiguration;
}

describe('ColumnsContainer mobile (V1.5)', () => {
  it('default: rendering tabellare classico, nessun dir rtl', () => {
    const html = renderToStaticMarkup(docWith({}), { rootBlockId: 'root' });
    expect(html).toContain('<table');
    expect(html).not.toContain('dir="rtl"');
  });

  it('stackOnMobile: colonne fluid inline-block che si impilano', () => {
    const html = renderToStaticMarkup(docWith({ stackOnMobile: true }), { rootBlockId: 'root' });
    expect(html).toContain('display:inline-block');
    expect(html).toContain('max-width:276px'); // (600-48)/2
    expect(html).toContain('dir="ltr"');
    // ordine DOM invariato: A prima di B
    expect(html.indexOf('COL-A')).toBeLessThan(html.indexOf('COL-B'));
  });

  it('reverseColumnsOnMobile: dir rtl sul contenitore e DOM invertito (desktop invariato)', () => {
    const html = renderToStaticMarkup(docWith({ stackOnMobile: true, reverseColumnsOnMobile: true }), {
      rootBlockId: 'root',
    });
    expect(html).toContain('dir="rtl"');
    // DOM invertito: B prima di A → impilate su mobile B sopra A, desktop visivamente A|B
    expect(html.indexOf('COL-B')).toBeLessThan(html.indexOf('COL-A'));
  });

  it('retrocompatibilità: i template senza i nuovi campi validano e rendono', () => {
    const html = renderToStaticMarkup(docWith({}), { rootBlockId: 'root' });
    expect(html).toContain('COL-A');
    expect(html).toContain('COL-B');
  });
});
