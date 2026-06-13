/**
 * Variabili dinamiche del template — {{nome_variabile}}.
 *
 * - extractVariables(doc): trova tutte le variabili usate nel documento
 * - resolveVariables(doc, testValues): sostituisce {{var}} con i valori di test
 *   (SOLO per l'anteprima — l'originale non viene mai modificato)
 * - useVariablesStore: store Zustand per i valori di test e lo stato di preview
 */

import { create } from 'zustand';

import type { TEditorConfiguration } from '@/documents/editor/core';

// ─── Pattern ─────────────────────────────────────────────────────────────────

export const VAR_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

// ─── Estrazione variabili dal documento ──────────────────────────────────────

/**
 * Scansiona tutti i blocchi e restituisce i nomi univoci delle variabili
 * trovate in qualsiasi campo di tipo stringa nelle props.
 */
export function extractVariables(doc: TEditorConfiguration): string[] {
  const found = new Set<string>();
  for (const block of Object.values(doc)) {
    const data = block.data as Record<string, unknown>;
    const props = (data?.props as Record<string, unknown>) ?? {};
    for (const val of Object.values(props)) {
      if (typeof val !== 'string' || !val.includes('{{')) continue;
      for (const match of val.matchAll(new RegExp(VAR_PATTERN.source, 'g'))) {
        found.add(match[1]);
      }
    }
  }
  return [...found].sort();
}

// ─── Sostituzione variabili per preview ─────────────────────────────────────

/**
 * Restituisce una copia del documento con le variabili sostituite dai valori di test.
 * Non modifica l'originale.
 */
export function resolveVariables(
  doc: TEditorConfiguration,
  testValues: Record<string, string>,
): TEditorConfiguration {
  if (Object.keys(testValues).length === 0) return doc;

  const resolved: TEditorConfiguration = { ...doc };

  for (const [id, block] of Object.entries(doc)) {
    const data = block.data as Record<string, unknown>;
    const props = (data?.props as Record<string, unknown>) ?? {};

    let changed = false;
    const newProps: Record<string, unknown> = { ...props };

    for (const [key, val] of Object.entries(props)) {
      if (typeof val !== 'string' || !val.includes('{{')) continue;
      const replaced = val.replace(
        new RegExp(VAR_PATTERN.source, 'g'),
        (_, name: string) => {
          if (name in testValues) {
            changed = true;
            return testValues[name];
          }
          return `{{${name}}}`;
        },
      );
      if (replaced !== val) newProps[key] = replaced;
    }

    if (changed) {
      // Type assertion: sostituiamo solo valori stringa — la struttura rimane compatibile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolved[id] = { ...block, data: { ...data, props: newProps } } as any;
    }
  }

  return resolved;
}

// ─── Zustand store ────────────────────────────────────────────────────────────

type TVariablesState = {
  /** Valori di test per le variabili: { nome: 'Marco', cognome: 'Rossi' } */
  testValues: Record<string, string>;
  /** true = l'anteprima mostra i valori di test al posto di {{var}} */
  previewActive: boolean;
  setTestValue: (name: string, value: string) => void;
  setPreviewActive: (v: boolean) => void;
  reset: () => void;
};

export const useVariablesStore = create<TVariablesState>((set) => ({
  testValues: {},
  previewActive: true,
  setTestValue: (name, value) =>
    set((s) => ({
      testValues: { ...s.testValues, [name]: value },
    })),
  setPreviewActive: (previewActive) => set({ previewActive }),
  reset: () => set({ testValues: {}, previewActive: true }),
}));
