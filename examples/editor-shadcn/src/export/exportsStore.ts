import { create } from 'zustand';

import { TEditorConfiguration } from '../documents/editor/core';

export type TExportRecord = {
  id: string;
  templateName: string;
  exportedAt: string;
  imagesIncluded: number;
  imagesSkipped: number;
  document: TEditorConfiguration;
};

/** Storico esportazioni della sessione (in-memory). */
export const useExportsStore = create<{ records: TExportRecord[] }>(() => ({ records: [] }));

export function useExportRecords() {
  return useExportsStore((s) => s.records);
}

export function addExportRecord(record: Omit<TExportRecord, 'id' | 'exportedAt'>) {
  const full: TExportRecord = {
    ...record,
    id: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
  };
  useExportsStore.setState((s) => ({ records: [full, ...s.records] }));
  return full;
}
