/**
 * Monitoraggio del peso dell'HTML generato (PRD §3.3).
 * Gmail tronca i messaggi oltre ~102 KB: soglia operativa di progetto 100 KB.
 */

export const WEIGHT_WARNING_BYTES = 80 * 1024;
export const WEIGHT_LIMIT_BYTES = 100 * 1024;

export type TWeightLevel = 'ok' | 'warning' | 'over';

export function htmlWeightBytes(html: string): number {
  return new Blob([html]).size;
}

export function classifyWeight(bytes: number): TWeightLevel {
  if (bytes > WEIGHT_LIMIT_BYTES) {
    return 'over';
  }
  if (bytes >= WEIGHT_WARNING_BYTES) {
    return 'warning';
  }
  return 'ok';
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(bytes >= 10 * 1024 ? 0 : 1)} KB`;
}
