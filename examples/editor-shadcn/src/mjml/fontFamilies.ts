/**
 * Mappa dai token font dell'editor ai nomi Google Fonts + URL per mj-font.
 * Se l'URL è null il font è web-safe e non richiede import.
 */
export type TFontEntry = {
  name: string;
  fallback: string;
  url: string | null;
};

export const FONT_FAMILIES: Record<string, TFontEntry> = {
  MODERN_SANS: {
    name: 'Inter',
    fallback: 'Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
  },
  BOOK_SANS: {
    name: 'Source Sans 3',
    fallback: 'Georgia, serif',
    url: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;700&display=swap',
  },
  ORGANIC_SANS: {
    name: 'Nunito',
    fallback: 'Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
  },
  GEOMETRIC_SANS: {
    name: 'Poppins',
    fallback: 'Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap',
  },
  HEAVY_SANS: {
    name: 'Oswald',
    fallback: 'Impact, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
  },
  ROUNDED_SANS: {
    name: 'Varela Round',
    fallback: 'Arial Rounded MT Bold, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
  },
  MODERN_SERIF: {
    name: 'Playfair Display',
    fallback: 'Georgia, serif',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
  },
  BOOK_SERIF: {
    name: 'Lora',
    fallback: 'Georgia, serif',
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
  },
  MONOSPACE: {
    name: 'Roboto Mono',
    fallback: 'Courier New, monospace',
    url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
  },
};

export const DEFAULT_FONT: TFontEntry = {
  name: 'Arial',
  fallback: 'Arial, sans-serif',
  url: null,
};

export function getFontEntry(token: string | null | undefined): TFontEntry {
  if (!token) return DEFAULT_FONT;
  return FONT_FAMILIES[token] ?? DEFAULT_FONT;
}

export function fontStack(token: string | null | undefined): string {
  const entry = getFontEntry(token);
  return entry.url ? `'${entry.name}', ${entry.fallback}` : entry.fallback;
}
