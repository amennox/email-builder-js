/**
 * Traduttore TEditorConfiguration → stringa MJML.
 *
 * Struttura MJML generata:
 *   <mjml>
 *     <mj-head>  ... font, attributi globali, style </mj-head>
 *     <mj-body>  ... sezioni recursive </mj-body>
 *   </mjml>
 *
 * Mapping blocchi:
 *   EmailLayout        → mj-body (root) + mj-head
 *   Container          → mj-section > mj-column (wrapper)
 *   ColumnsContainer   → mj-section con 1–3 mj-column (dal layout colonne)
 *   Text               → mj-text
 *   Heading            → mj-text (con font-size da livello h1/h2/h3)
 *   Button             → mj-button (wrappato in mj-section > mj-column se top-level)
 *   Image              → mj-image
 *   Avatar             → mj-image con border-radius
 *   Divider            → mj-divider
 *   Spacer             → mj-spacer
 *   Html               → mj-raw
 */

import type { TEditorConfiguration, TEditorBlock } from '../documents/editor/core';
import { fontStack, getFontEntry, DEFAULT_FONT } from './fontFamilies';
import { attrs, buttonFontSize, buttonRadius, escHtml, headingFontSize, padAttr } from './helpers';

// ─── Tipi interni ────────────────────────────────────────────────────────────

type BlockData = TEditorBlock['data'];
type AnyProps = Record<string, unknown>;

function blockData(b: TEditorBlock): BlockData {
  return b.data as BlockData;
}

function bProps(b: TEditorBlock): AnyProps {
  const d = blockData(b) as Record<string, unknown>;
  return (d?.props as AnyProps) ?? {};
}

function bStyle(b: TEditorBlock): AnyProps {
  const d = blockData(b) as Record<string, unknown>;
  return (d?.style as AnyProps) ?? {};
}

// ─── Font collector ──────────────────────────────────────────────────────────

function collectFonts(doc: TEditorConfiguration): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const block of Object.values(doc)) {
    const s = bStyle(block);
    const fontToken = s.fontFamily as string | null | undefined;
    if (fontToken) {
      const entry = getFontEntry(fontToken);
      if (entry.url && !seen.has(entry.name)) {
        seen.add(entry.name);
        lines.push(`    <mj-font name="${entry.name}" href="${entry.url}" />`);
      }
    }
  }
  return lines.join('\n');
}

// ─── Block translators ───────────────────────────────────────────────────────

function translateText(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const text = (p.text as string) ?? '';
  const a = attrs({
    'font-size': s.fontSize ? `${s.fontSize}px` : null,
    'font-family': s.fontFamily ? fontStack(s.fontFamily as string) : null,
    'font-weight': (s.fontWeight as string) ?? null,
    'color': (s.color as string) ?? null,
    'align': (s.textAlign as string) ?? null,
    'background-color': (s.backgroundColor as string) ?? null,
    'container-background-color': (s.backgroundColor as string) ?? null,
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-text ${combined}>${escHtml(text)}</mj-text>`;
}

function translateHeading(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const text = (p.text as string) ?? '';
  const level = (p.level as 'h1' | 'h2' | 'h3') ?? 'h2';
  const a = attrs({
    'font-size': s.fontSize ? `${s.fontSize}px` : headingFontSize(level),
    'font-family': s.fontFamily ? fontStack(s.fontFamily as string) : null,
    'font-weight': 'bold',
    'color': (s.color as string) ?? null,
    'align': (s.textAlign as string) ?? null,
    'background-color': (s.backgroundColor as string) ?? null,
    'container-background-color': (s.backgroundColor as string) ?? null,
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-text ${combined}><${level}>${escHtml(text)}</${level}></mj-text>`;
}

function translateButton(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const text = (p.text as string) ?? 'Click';
  const url = (p.url as string) || '#';
  const btnBg = (p.buttonBackgroundColor as string) ?? '#999999';
  const btnColor = (p.buttonTextColor as string) ?? '#FFFFFF';
  const btnStyle = p.buttonStyle as 'pill' | 'rounded' | 'rectangle' | null | undefined;
  const a = attrs({
    'href': url,
    'background-color': btnBg,
    'color': btnColor,
    'font-size': s.fontSize ? `${s.fontSize}px` : buttonFontSize(p.size as Parameters<typeof buttonFontSize>[0]),
    'font-family': s.fontFamily ? fontStack(s.fontFamily as string) : null,
    'font-weight': (s.fontWeight as string) ?? null,
    'border-radius': buttonRadius(btnStyle),
    'align': (s.textAlign as string) ?? 'center',
    'width': p.fullWidth ? '100%' : null,
    'inner-padding': '10px 20px',
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-button ${combined}>${escHtml(text)}</mj-button>`;
}

function translateImage(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const url = (p.url as string) || 'https://placehold.co/600x200';
  const a = attrs({
    'src': url,
    'alt': (p.alt as string) ?? '',
    'href': (p.linkHref as string) ?? null,
    'width': p.width ? `${p.width}px` : null,
    'align': (s.textAlign as string) ?? 'center',
    'background-color': (s.backgroundColor as string) ?? null,
    'container-background-color': (s.backgroundColor as string) ?? null,
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-image ${combined} />`;
}

function translateAvatar(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const url = (p.imageUrl as string) || 'https://placehold.co/64x64';
  const size = (p.size as number) ?? 64;
  const shape = (p.shape as string) ?? 'circle';
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0px';
  const a = attrs({
    'src': url,
    'alt': (p.alt as string) ?? '',
    'width': `${size}px`,
    'border-radius': radius,
    'align': (s.textAlign as string) ?? 'center',
    'container-background-color': (s.backgroundColor as string) ?? null,
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-image ${combined} />`;
}

function translateDivider(block: TEditorBlock): string {
  const p = bProps(block);
  const s = bStyle(block);
  const lineColor = (p.lineColor as string) ?? '#CCCCCC';
  const lineHeight = (p.lineHeight as number) ?? 1;
  const a = attrs({
    'border-color': lineColor,
    'border-width': `${lineHeight}px`,
    'container-background-color': (s.backgroundColor as string) ?? null,
  });
  const pad = padAttr(s.padding as Parameters<typeof padAttr>[0]);
  const combined = [a, pad].filter(Boolean).join(' ');
  return `    <mj-divider ${combined} />`;
}

function translateSpacer(block: TEditorBlock): string {
  const p = bProps(block);
  const height = (p.height as number) ?? 16;
  return `    <mj-spacer height="${height}px" />`;
}

function translateHtml(block: TEditorBlock): string {
  const p = bProps(block);
  const html = (p.html as string) ?? '';
  return `    <mj-raw>${html}</mj-raw>`;
}

// ─── Blocchi container (ricorsivi) ───────────────────────────────────────────

function translateChildren(
  doc: TEditorConfiguration,
  ids: string[],
  usedFontTokens: Set<string>,
): string {
  return ids
    .filter((id) => id in doc)
    .map((id) => translateBlock(doc, id, usedFontTokens))
    .join('\n');
}

/**
 * Container → mj-section > mj-column (wrappa i figli).
 * Il Container non è un mj-section autonomo: i suoi figli sono blocchi
 * (testo, immagini…) che devono stare in mj-column.
 */
function translateContainer(block: TEditorBlock, doc: TEditorConfiguration, usedFontTokens: Set<string>): string {
  const s = bStyle(block);
  const p = bProps(block);
  const childrenIds = (p.childrenIds as string[]) ?? [];
  const bgColor = (s.backgroundColor as string) ?? null;
  const pad = (s.padding as { top: number; bottom: number; right: number; left: number } | null | undefined);

  const sectionAttrs = attrs({
    'background-color': bgColor ?? null,
    'padding': pad ? `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px` : null,
    'border-radius': s.borderRadius ? `${s.borderRadius}px` : null,
  });
  const children = translateChildren(doc, childrenIds, usedFontTokens);
  return `<mj-section ${sectionAttrs}>\n  <mj-column>\n${children}\n  </mj-column>\n</mj-section>`;
}

/**
 * ColumnsContainer → mj-section con N mj-column (1–3).
 * Ogni colonna wrappa i propri blocchi figli.
 */
function translateColumnsContainer(
  block: TEditorBlock,
  doc: TEditorConfiguration,
  usedFontTokens: Set<string>,
): string {
  const s = bStyle(block);
  const p = bProps(block);
  const columns = (p.columns as Array<{ childrenIds: string[] }>) ?? [];
  const columnsCount = (p.columnsCount as number) ?? (columns.length > 0 ? columns.length : 2);
  const bgColor = (s.backgroundColor as string) ?? null;
  const pad = (s.padding as { top: number; bottom: number; right: number; left: number } | null | undefined);

  const sectionAttrs = attrs({
    'background-color': bgColor ?? null,
    'padding': pad ? `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px` : null,
  });

  // Calcola larghezza colonne da columnWidths se presenti
  const widths = (p.columnWidths as number[]) ?? null;
  const totalWidth = widths ? widths.reduce((a, b) => a + b, 0) : 1;

  const mjColumns = columns
    .slice(0, columnsCount)
    .map((col, i) => {
      const widthPct = widths ? Math.round((widths[i] / totalWidth) * 100) + '%' : null;
      const colAttr = widthPct ? `width="${widthPct}"` : '';
      const colChildren = translateChildren(doc, col.childrenIds ?? [], usedFontTokens);
      return `  <mj-column ${colAttr}>\n${colChildren}\n  </mj-column>`;
    })
    .join('\n');

  return `<mj-section ${sectionAttrs}>\n${mjColumns}\n</mj-section>`;
}

// ─── Dispatcher principale ────────────────────────────────────────────────────

function translateBlock(
  doc: TEditorConfiguration,
  id: string,
  usedFontTokens: Set<string>,
): string {
  const block = doc[id];
  if (!block) return '';

  // Raccoglie font usati
  const s = bStyle(block);
  const fontToken = s.fontFamily as string | null | undefined;
  if (fontToken) usedFontTokens.add(fontToken);

  switch (block.type) {
    case 'Container':
      return translateContainer(block, doc, usedFontTokens);
    case 'ColumnsContainer':
      return translateColumnsContainer(block, doc, usedFontTokens);
    case 'Text':
      return translateText(block);
    case 'Heading':
      return translateHeading(block);
    case 'Button':
      return translateButton(block);
    case 'Image':
      return translateImage(block);
    case 'Avatar':
      return translateAvatar(block);
    case 'Divider':
      return translateDivider(block);
    case 'Spacer':
      return translateSpacer(block);
    case 'Html':
      return translateHtml(block);
    default:
      return `<!-- unsupported block type: ${block.type} -->`;
  }
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

/**
 * Traduce un TEditorConfiguration in una stringa MJML completa.
 * @throws se manca il blocco 'root' di tipo EmailLayout.
 */
export function translateToMjml(doc: TEditorConfiguration): string {
  const root = doc['root'];
  if (!root || root.type !== 'EmailLayout') {
    throw new Error('Il documento deve avere un blocco root di tipo EmailLayout');
  }

  const rootData = root.data as {
    backdropColor?: string | null;
    canvasColor?: string | null;
    textColor?: string | null;
    fontFamily?: string | null;
    borderRadius?: number | null;
    childrenIds?: string[] | null;
  };

  const usedFontTokens = new Set<string>();
  if (rootData.fontFamily) usedFontTokens.add(rootData.fontFamily);

  const childrenIds = rootData.childrenIds ?? [];
  const bodyContent = translateChildren(doc, childrenIds, usedFontTokens);

  // Costruisce head dopo aver raccolto tutti i font
  const fontLines = collectFonts(doc);
  const globalFont = rootData.fontFamily
    ? getFontEntry(rootData.fontFamily)
    : DEFAULT_FONT;

  const headStyle = `
    <mj-attributes>
      <mj-all font-family="'${globalFont.name}', ${globalFont.fallback}" />
      <mj-text font-size="14px" color="${rootData.textColor ?? '#242424'}" line-height="1.6" />
    </mj-attributes>`;

  const bodyAttrs = attrs({
    'background-color': rootData.backdropColor ?? '#F5F5F5',
    'width': '600px',
  });

  return `<mjml>
  <mj-head>
${fontLines}${headStyle}
  </mj-head>
  <mj-body ${bodyAttrs}>
${bodyContent}
  </mj-body>
</mjml>`;
}
