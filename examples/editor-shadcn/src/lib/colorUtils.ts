/**
 * Utilità per la gestione colori nell'editor.
 *
 * - Conversioni hex ↔ RGB ↔ HSL
 * - computeHarmonyColors: armonie standard (complementare, analoghi, triadico, tinte, ombre)
 * - extractProjectColors: scansiona il documento e restituisce i colori usati
 */

// ─── Hex ↔ RGB ↔ HSL ─────────────────────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;
  return [
    Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hn) * 255),
    Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function hexToHsl(hex: string): [number, number, number] | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(...rgb);
}

export function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

// ─── Armonía colori ───────────────────────────────────────────────────────────

export type HarmonyGroup = {
  key: string;
  colors: string[];
};

/**
 * Calcola gruppi di colori armonici partendo dal colore base.
 * Usa trasformazioni HSL standard della teoria del colore.
 */
export function computeHarmonyColors(hex: string): HarmonyGroup[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [];
  const [h, s, l] = hsl;

  const rot = (deg: number) => ((h + deg) % 360 + 360) % 360;
  const clampL = (v: number) => Math.max(5, Math.min(95, v));
  const clampS = (v: number) => Math.max(0, Math.min(100, v));

  return [
    {
      key: 'complementary',
      colors: [hslToHex(rot(180), s, l)],
    },
    {
      key: 'splitComp',
      colors: [hslToHex(rot(150), s, l), hslToHex(rot(210), s, l)],
    },
    {
      key: 'analogous',
      colors: [
        hslToHex(rot(-30), s, l),
        hslToHex(rot(30), s, l),
        hslToHex(rot(-60), s, l),
        hslToHex(rot(60), s, l),
      ],
    },
    {
      key: 'triadic',
      colors: [hslToHex(rot(120), s, l), hslToHex(rot(240), s, l)],
    },
    {
      key: 'tints',
      colors: [
        hslToHex(h, clampS(s - 10), clampL(l + 40)),
        hslToHex(h, clampS(s - 5), clampL(l + 25)),
        hslToHex(h, s, clampL(l + 12)),
      ],
    },
    {
      key: 'shades',
      colors: [
        hslToHex(h, s, clampL(l - 12)),
        hslToHex(h, clampS(s + 5), clampL(l - 25)),
        hslToHex(h, clampS(s + 10), clampL(l - 40)),
      ],
    },
  ];
}

// ─── Estrazione colori dal documento ─────────────────────────────────────────

const HEX_RE = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
const SKIP_VALUES = new Set(['#FFFFFF', '#ffffff', '#000000', '#000', '#FFF', '#fff']);

function scanColors(obj: unknown, found: Set<string>) {
  if (!obj || typeof obj !== 'object') return;
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof val === 'string') {
      const upper = val.toUpperCase();
      if (
        HEX_RE.test(val) &&
        !SKIP_VALUES.has(val) &&
        (key.toLowerCase().includes('color') || key === 'backgroundColor')
      ) {
        found.add(upper.length === 4 ? `#${upper[1]}${upper[1]}${upper[2]}${upper[2]}${upper[3]}${upper[3]}` : upper);
      }
    } else if (typeof val === 'object') {
      scanColors(val, found);
    }
  }
}

/**
 * Restituisce i colori hex unici usati nel documento (escluso bianco/nero puri).
 */
export function extractProjectColors(doc: Record<string, unknown>): string[] {
  const found = new Set<string>();
  scanColors(doc, found);
  return [...found];
}
