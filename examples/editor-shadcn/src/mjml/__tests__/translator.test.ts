import { describe, expect, it } from 'vitest';

import { renderToMjmlString } from '../index';

// Documento minimo valido
const MINIMAL_DOC = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#000000',
      childrenIds: ['container1'],
    },
  },
  container1: {
    type: 'Container',
    data: {
      style: { backgroundColor: '#FFFFFF', padding: { top: 16, bottom: 16, right: 24, left: 24 } },
      props: { childrenIds: ['heading1', 'text1', 'btn1', 'img1', 'divider1', 'spacer1'] },
    },
  },
  heading1: {
    type: 'Heading',
    data: {
      props: { text: 'Titolo email', level: 'h1' },
      style: { color: '#333333', textAlign: 'center' },
    },
  },
  text1: {
    type: 'Text',
    data: {
      props: { text: 'Corpo del messaggio.' },
      style: { color: '#555555', fontSize: 14 },
    },
  },
  btn1: {
    type: 'Button',
    data: {
      props: {
        text: 'Clicca qui',
        url: 'https://example.com',
        buttonBackgroundColor: '#2F4A3C',
        buttonTextColor: '#FFFFFF',
        buttonStyle: 'rounded',
      },
      style: { textAlign: 'center' },
    },
  },
  img1: {
    type: 'Image',
    data: {
      props: { url: 'https://example.com/img.jpg', alt: 'Un\'immagine', width: 600 },
      style: { textAlign: 'center' },
    },
  },
  divider1: {
    type: 'Divider',
    data: {
      props: { lineColor: '#CCCCCC', lineHeight: 1 },
      style: {},
    },
  },
  spacer1: {
    type: 'Spacer',
    data: { props: { height: 24 } },
  },
} as const;

const COLUMNS_DOC = {
  root: {
    type: 'EmailLayout',
    data: {
      childrenIds: ['cols'],
    },
  },
  cols: {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#FAFAFA' },
      props: {
        columnsCount: 2,
        columns: [
          { childrenIds: ['t1'] },
          { childrenIds: ['t2'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  t1: { type: 'Text', data: { props: { text: 'Colonna 1' }, style: {} } },
  t2: { type: 'Text', data: { props: { text: 'Colonna 2' }, style: {} } },
} as const;

describe('renderToMjmlString', () => {
  it('produce una stringa MJML con tag <mjml>', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mjml>');
    expect(out).toContain('</mjml>');
  });

  it('contiene mj-head e mj-body', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mj-head>');
    expect(out).toContain('<mj-body');
  });

  it('traduce Heading in mj-text con tag h1', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<h1>Titolo email</h1>');
  });

  it('traduce Button in mj-button', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mj-button');
    expect(out).toContain('Clicca qui');
    expect(out).toContain('href="https://example.com"');
  });

  it('traduce Image in mj-image', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mj-image');
    expect(out).toContain('src="https://example.com/img.jpg"');
    expect(out).toContain('alt=');
  });

  it('traduce Divider in mj-divider', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mj-divider');
  });

  it('traduce Spacer in mj-spacer', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('<mj-spacer height="24px"');
  });

  it('traduce ColumnsContainer in mj-section con mj-column multipli', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(COLUMNS_DOC as any);
    expect(out).toContain('<mj-section');
    const colCount = (out.match(/<mj-column/g) ?? []).length;
    expect(colCount).toBeGreaterThanOrEqual(2);
    expect(out).toContain('Colonna 1');
    expect(out).toContain('Colonna 2');
  });

  it('lancia un errore se manca il blocco root', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderToMjmlString({ notRoot: { type: 'Text', data: {} } } as any)).toThrow();
  });

  it('include il colore backdropColor nel body', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = renderToMjmlString(MINIMAL_DOC as any);
    expect(out).toContain('#F5F5F5');
  });
});
