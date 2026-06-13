/** Converte padding {top,right,bottom,left} → stringa MJML shorthand. */
export function padAttr(
  padding: { top: number; bottom: number; right: number; left: number } | null | undefined,
): string {
  if (!padding) return '';
  return `padding="${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px"`;
}

/** Emette solo gli attributi che hanno un valore (stringa non vuota). */
export function attrs(map: Record<string, string | number | null | undefined>): string {
  return Object.entries(map)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}="${String(v)}"`)
    .join(' ');
}

/**
 * Converte border-radius da "pill"|"rounded"|"rectangle" a pixel.
 * Usato per mj-button.
 */
export function buttonRadius(style: 'pill' | 'rounded' | 'rectangle' | null | undefined): string {
  switch (style) {
    case 'pill':
      return '999px';
    case 'rounded':
      return '4px';
    default:
      return '0px';
  }
}

/**
 * Converte size del bottone in font-size approssimativo.
 */
export function buttonFontSize(size: 'x-small' | 'small' | 'medium' | 'large' | null | undefined): string {
  switch (size) {
    case 'x-small':
      return '11px';
    case 'small':
      return '13px';
    case 'large':
      return '18px';
    default:
      return '15px';
  }
}

/** Heading level → font size default. */
export function headingFontSize(level: 'h1' | 'h2' | 'h3' | null | undefined): string {
  switch (level) {
    case 'h1':
      return '32px';
    case 'h3':
      return '20px';
    default:
      return '24px';
  }
}

/**
 * Escape HTML entities per testo in mj-text/mj-button.
 * MJML accetta HTML, ma usiamo il testo grezzo dei blocchi (già HTML
 * dal blocco Text/Heading quando markdown=false).
 */
export function escHtml(s: string | null | undefined): string {
  if (!s) return '';
  // Il testo nei blocchi può già contenere HTML (dal renderer React).
  // Lo passiamo as-is a MJML che lo accetta come HTML interno.
  return s;
}
