import { renderToStaticMarkup } from '@/email';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import { TEditorConfiguration } from '../documents/editor/core';

/**
 * Estrae tutti gli URL immagine dal documento.
 * Campi immagine noti (dagli schemi zod dei blocchi): Image.props.url, Avatar.props.imageUrl.
 */
export function extractImageUrls(document: TEditorConfiguration): string[] {
  const urls = new Set<string>();
  for (const block of Object.values(document)) {
    const b = block as { type: string; data?: { props?: Record<string, unknown> } };
    const props = b.data?.props;
    if (!props) {
      continue;
    }
    if (b.type === 'Image' && typeof props.url === 'string' && props.url) {
      urls.add(props.url);
    }
    if (b.type === 'Avatar' && typeof props.imageUrl === 'string' && props.imageUrl) {
      urls.add(props.imageUrl);
    }
  }
  return [...urls];
}

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

function extensionFor(contentType: string | null, url: string): string {
  if (contentType && EXTENSION_BY_CONTENT_TYPE[contentType.split(';')[0].trim()]) {
    return EXTENSION_BY_CONTENT_TYPE[contentType.split(';')[0].trim()];
  }
  const match = /\.([a-zA-Z0-9]{2,5})(?:\?|#|$)/.exec(url);
  return match ? match[1].toLowerCase() : 'png';
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'template'
  );
}

/** Riscrive gli URL assoluti con i path relativi nella stringa HTML. */
export function rewriteImageUrls(html: string, mapping: Map<string, string>): string {
  let result = html;
  for (const [absolute, relative] of mapping) {
    result = result.split(absolute).join(relative);
  }
  return result;
}

export type TZipExportResult = {
  fileName: string;
  imagesIncluded: number;
  skippedUrls: string[];
};

type TFetchLike = typeof fetch;

/**
 * Compone lo ZIP (email.html + template.json + images/) e lo scarica.
 * Le immagini il cui fetch fallisce (es. CORS) restano con URL assoluto e
 * vengono segnalate in skippedUrls: l'export non fallisce mai per questo.
 */
export async function buildTemplateZip(
  name: string,
  document: TEditorConfiguration,
  fetchImpl: TFetchLike = fetch,
): Promise<{ zip: JSZip; result: TZipExportResult }> {
  const html = renderToStaticMarkup(document, { rootBlockId: 'root' });
  const urls = extractImageUrls(document);

  const mapping = new Map<string, string>();
  const skippedUrls: string[] = [];
  const zip = new JSZip();
  const images = zip.folder('images')!;

  let counter = 0;
  for (const url of urls) {
    try {
      const response = await fetchImpl(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      counter += 1;
      const fileName = `img-${String(counter).padStart(3, '0')}.${extensionFor(
        response.headers.get('content-type'),
        url,
      )}`;
      images.file(fileName, blob);
      mapping.set(url, `images/${fileName}`);
    } catch {
      skippedUrls.push(url);
    }
  }

  zip.file('email.html', rewriteImageUrls(html, mapping));
  zip.file('template.json', JSON.stringify(document, null, 2));

  return {
    zip,
    result: {
      fileName: `${slugify(name)}.zip`,
      imagesIncluded: mapping.size,
      skippedUrls,
    },
  };
}

export async function exportTemplateAsZip(name: string, document: TEditorConfiguration): Promise<TZipExportResult> {
  const { zip, result } = await buildTemplateZip(name, document);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, result.fileName);
  return result;
}
