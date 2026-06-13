/**
 * API pubblica del modulo MJML.
 *
 * Uso:
 *   import { renderToMjmlString, mjmlToHtml } from '@/mjml';
 *
 *   const mjml = renderToMjmlString(document);
 *   const { html, errors } = await mjmlToHtml(mjml);
 */

import type { TEditorConfiguration } from '../documents/editor/core';
import { translateToMjml } from './translator';

export { translateToMjml };

export type TMjmlResult = {
  html: string;
  errors: Array<{ message: string; severity: number }>;
};

/**
 * Traduce il documento in stringa MJML (sincrono, nessuna dipendenza esterna).
 */
export function renderToMjmlString(doc: TEditorConfiguration): string {
  return translateToMjml(doc);
}

/**
 * Compila MJML → HTML usando mjml-browser (lazy import per non appesantire il bundle iniziale).
 * Restituisce sempre un risultato anche in presenza di errori non bloccanti.
 */
export async function mjmlToHtml(mjmlString: string): Promise<TMjmlResult> {
  // Lazy load mjml-browser per code splitting
  const { default: mjml2html } = await import('mjml-browser');
  const result = await mjml2html(mjmlString, {
    validationLevel: 'soft',
    minify: false,
  });
  return {
    html: result.html ?? '',
    errors: (result.errors ?? []).map((e) => ({
      message: (e as { formattedMessage?: string; message?: string }).formattedMessage
        ?? (e as { message?: string }).message
        ?? 'Unknown error',
      severity: (e as { severity?: number }).severity ?? 0,
    })),
  };
}

/**
 * Convenienza: traduce documento → MJML → HTML in un singolo passaggio.
 */
export async function renderToMjmlHtml(doc: TEditorConfiguration): Promise<TMjmlResult> {
  const mjmlString = renderToMjmlString(doc);
  return mjmlToHtml(mjmlString);
}
