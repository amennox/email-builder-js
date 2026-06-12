import { describe, expect, it } from 'vitest';

import { TEditorConfiguration } from '../../documents/editor/core';
import { buildTemplateZip, extractImageUrls, rewriteImageUrls, slugify } from '../exportZip';

const DOC: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: { childrenIds: ['img1', 'img2', 'avatar1'] },
  },
  img1: { type: 'Image', data: { props: { url: 'https://example.com/a.png' } } },
  // URL duplicato: deve essere deduplicato
  img2: { type: 'Image', data: { props: { url: 'https://example.com/a.png' } } },
  avatar1: { type: 'Avatar', data: { props: { imageUrl: 'https://example.com/b.jpg' } } },
} as TEditorConfiguration;

function fakeFetchOk(url: string) {
  return Promise.resolve({
    ok: true,
    headers: { get: () => (url.endsWith('.png') ? 'image/png' : 'image/jpeg') },
    blob: () => Promise.resolve(new Blob([`bytes-of-${url}`])),
  } as unknown as Response);
}

describe('exportZip', () => {
  it('estrae gli URL immagine deduplicati', () => {
    expect(extractImageUrls(DOC).sort()).toEqual(['https://example.com/a.png', 'https://example.com/b.jpg']);
  });

  it('riscrive gli URL nel markup', () => {
    const html = '<img src="https://example.com/a.png"><img src="https://example.com/a.png">';
    const mapping = new Map([['https://example.com/a.png', 'images/img-001.png']]);
    const out = rewriteImageUrls(html, mapping);
    expect(out).not.toContain('https://example.com/a.png');
    expect(out.match(/images\/img-001\.png/g)).toHaveLength(2);
  });

  it('slugify produce nomi file sicuri', () => {
    expect(slugify('La mia Émail / 2026!')).toBe('la-mia-email-2026');
    expect(slugify('***')).toBe('template');
  });

  it('zip contiene email.html, template.json e images/', async () => {
    const { zip, result } = await buildTemplateZip('Test', DOC, fakeFetchOk as typeof fetch);
    const names = Object.keys(zip.files);
    expect(names).toContain('email.html');
    expect(names).toContain('template.json');
    expect(names.filter((n) => n.startsWith('images/') && !zip.files[n].dir)).toHaveLength(2);
    expect(result.imagesIncluded).toBe(2);
    expect(result.skippedUrls).toEqual([]);
    // il template.json conserva gli URL assoluti
    const json = await zip.files['template.json'].async('string');
    expect(json).toContain('https://example.com/a.png');
  });

  it('fetch fallito (CORS) → immagine esclusa ma export riuscito, URL assoluto preservato', async () => {
    const failingFetch = (url: string) =>
      url.endsWith('.jpg') ? Promise.reject(new Error('CORS')) : fakeFetchOk(url);
    const { zip, result } = await buildTemplateZip('Test', DOC, failingFetch as typeof fetch);
    expect(result.imagesIncluded).toBe(1);
    expect(result.skippedUrls).toEqual(['https://example.com/b.jpg']);
    const html = await zip.files['email.html'].async('string');
    expect(html).toContain('https://example.com/b.jpg');
    expect(html).toContain('images/img-001.png');
  });
});
