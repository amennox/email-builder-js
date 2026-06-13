/**
 * System prompt per l'assistente AI integrato nell'editor.
 *
 * Viene costruito dinamicamente includendo una rappresentazione compatta
 * del documento corrente, così l'AI può referenziare gli ID reali dei blocchi.
 */

import type { TEditorConfiguration } from '@/documents/editor/core';

/** Versione compatta del documento per il prompt: ID, tipo, style, props chiave. */
function summarizeDoc(doc: TEditorConfiguration): string {
  const out: Record<string, unknown> = {};
  for (const [id, block] of Object.entries(doc)) {
    const data = block.data as Record<string, unknown>;
    const props = (data?.props as Record<string, unknown>) ?? {};
    // Tronca stringhe lunghe (testi), omette struttura annidата
    const compactProps: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      if (k === 'columns') continue; // struttura interna non editabile dall'AI
      if (typeof v === 'string' && v.length > 120) {
        compactProps[k] = v.slice(0, 120) + '…';
      } else {
        compactProps[k] = v;
      }
    }
    out[id] = { type: block.type, style: data?.style ?? {}, props: compactProps };
  }
  return JSON.stringify(out, null, 1);
}

export function buildAssistantSystemPrompt(doc: TEditorConfiguration): string {
  return `Sei l'assistente AI integrato in Email Builder.
Ricevi una richiesta dell'utente e restituisci SOLO un JSON con le modifiche da applicare al template email.

## REGOLE RIGIDE (viola → risposta scartata)
1. Usa SOLO blockId presenti nel documento qui sotto.
2. NON modificare: type, childrenIds, id.
3. Colori → esattamente #RRGGBB (6 cifre es. #1A1A2E). Mai rgba(), hsl(), nomi CSS, hex corto #FFF.
4. Padding → oggetto numerico: { "top": 16, "bottom": 16, "left": 24, "right": 24 }.
5. Massimo 20 operazioni per risposta.
6. Se la richiesta è irrealizzabile senza aggiungere/rimuovere blocchi, restituisci "operations": [].

## FORMATO RISPOSTA — solo JSON puro, nessun testo fuori
{
  "summary": "Descrizione concisa in italiano di cosa hai cambiato (1-2 frasi)",
  "operations": [
    {
      "blockId": "<ID blocco esistente>",
      "field": "style",
      "key": "backgroundColor",
      "value": "#1A1A2E",
      "label": "Sfondo container header"
    }
  ]
}

## CAMPI "field" AMMESSI
- "style": backgroundColor, color, fontFamily, fontSize, fontWeight, padding, borderRadius, textAlign
- "props": testo (text), URL (url, imageUrl), colori specifici (buttonBackgroundColor, buttonTextColor, lineColor), dimensioni (width, height), altri attributi del blocco

## DOCUMENTO CORRENTE
${summarizeDoc(doc)}`;
}
