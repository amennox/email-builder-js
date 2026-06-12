import { TEditorConfiguration } from '../documents/editor/core';

import { classifyWeight, htmlWeightBytes } from './htmlWeight';

export type TPreflightRule = 'missing-alt' | 'empty-href' | 'low-contrast' | 'overweight';

export type TPreflightIssue = {
  rule: TPreflightRule;
  /** null per problemi a livello documento (es. peso) */
  blockId: string | null;
  detail?: string;
};

// ---- contrasto WCAG ----

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) {
    return null;
  }
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hexA: string, hexB: string): number | null {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) {
    return null;
  }
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const MIN_CONTRAST = 4.5;

// ---- regole ----

type TAnyBlock = {
  type: string;
  data?: {
    style?: Record<string, unknown> | null;
    props?: Record<string, unknown> | null;
  };
};

export function runPreflight(document: TEditorConfiguration, html: string): TPreflightIssue[] {
  const issues: TPreflightIssue[] = [];

  const root = document.root as TAnyBlock | undefined;
  const canvasColor = (root?.data as { canvasColor?: string } | undefined)?.canvasColor ?? '#FFFFFF';
  const rootTextColor = (root?.data as { textColor?: string } | undefined)?.textColor ?? '#262626';

  for (const [blockId, b] of Object.entries(document)) {
    if (blockId === 'root') {
      continue;
    }
    const block = b as TAnyBlock;
    const props = block.data?.props ?? {};
    const style = block.data?.style ?? {};

    // missing-alt: immagini con url ma senza alt
    if (block.type === 'Image' && props.url && !(typeof props.alt === 'string' && props.alt.trim())) {
      issues.push({ rule: 'missing-alt', blockId });
    }
    if (block.type === 'Avatar' && props.imageUrl && !(typeof props.alt === 'string' && props.alt.trim())) {
      issues.push({ rule: 'missing-alt', blockId });
    }

    // empty-href: bottoni senza destinazione (o '#'), immagini linkate a '#'
    if (block.type === 'Button') {
      const url = typeof props.url === 'string' ? props.url.trim() : '';
      if (!url || url === '#') {
        issues.push({ rule: 'empty-href', blockId });
      }
    }
    if (block.type === 'Image' && props.linkHref === '#') {
      issues.push({ rule: 'empty-href', blockId });
    }

    // low-contrast: testo vs sfondo (solo quando entrambi i colori sono noti/derivabili)
    if (block.type === 'Text' || block.type === 'Heading') {
      const color = (style.color as string | undefined) ?? rootTextColor;
      const bg = (style.backgroundColor as string | undefined) ?? canvasColor;
      const ratio = contrastRatio(color, bg);
      if (ratio !== null && ratio < MIN_CONTRAST) {
        issues.push({ rule: 'low-contrast', blockId, detail: `${ratio.toFixed(2)}:1` });
      }
    }
    if (block.type === 'Button') {
      const ratio =
        typeof props.buttonTextColor === 'string' && typeof props.buttonBackgroundColor === 'string'
          ? contrastRatio(props.buttonTextColor, props.buttonBackgroundColor)
          : null;
      if (ratio !== null && ratio < MIN_CONTRAST) {
        issues.push({ rule: 'low-contrast', blockId, detail: `${ratio.toFixed(2)}:1` });
      }
    }
  }

  // overweight
  const bytes = htmlWeightBytes(html);
  if (classifyWeight(bytes) === 'over') {
    issues.push({ rule: 'overweight', blockId: null, detail: `${Math.round(bytes / 1024)} KB` });
  }

  return issues;
}
