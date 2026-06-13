/**
 * Suggerimento AI per il colore di un elemento email.
 *
 * Invia al proxy: colore corrente, etichetta del campo (contesto),
 * colori esistenti nel template. Riceve: hex suggerito + motivazione.
 */

import { aiChat, AiUnavailableError } from './client';

export { AiUnavailableError };

export type ColorSuggestion = {
  color: string;   // "#RRGGBB"
  reason: string;  // breve motivazione
};

const SYSTEM = `You are a color recommendation engine for email templates.
Given the current element, its existing color, and the palette already used in the template, suggest ONE optimal hex color.

Rules:
- Respond ONLY with valid JSON: { "color": "#RRGGBB", "reason": "one sentence" }
- The color must work as a standalone email design color
- For text/foreground elements: ensure WCAG AA contrast (≥4.5:1) against likely backgrounds
- For backgrounds: choose a color that harmonizes with the existing palette
- Keep the reason short (max 12 words), in the same language as the field label
- No markdown, no code fences`;

export async function suggestColor(params: {
  fieldLabel: string;
  currentColor: string;
  projectColors: string[];
}): Promise<ColorSuggestion> {
  const { fieldLabel, currentColor, projectColors } = params;

  const user = [
    `Element: ${fieldLabel}`,
    `Current color: ${currentColor || 'none'}`,
    `Existing template colors: ${projectColors.length > 0 ? projectColors.join(', ') : 'none'}`,
  ].join('\n');

  const raw = await aiChat(
    [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: user },
    ],
    { jsonResponse: true, temperature: 0.5 },
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Risposta AI non valida.');
  }

  const p = parsed as Record<string, unknown>;
  const color = typeof p?.color === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(p.color)
    ? p.color.toUpperCase()
    : null;

  if (!color) throw new Error('Colore AI non valido.');

  return {
    color,
    reason: typeof p?.reason === 'string' ? p.reason : '',
  };
}
