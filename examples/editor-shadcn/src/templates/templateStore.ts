import { z } from 'zod';
import { create } from 'zustand';

import { EditorConfigurationSchema, TEditorConfiguration } from '../documents/editor/core';

export type TSavedTemplate = {
  id: string;
  name: string;
  document: TEditorConfiguration;
  createdAt: string;
  updatedAt: string;
};

const SavedTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  document: EditorConfigurationSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TEMPLATES_STORAGE_KEY = 'emailbuilder:templates';

type TStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

let storage: TStorageLike = typeof localStorage !== 'undefined' ? localStorage : ({} as TStorageLike);

/** Permette ai test di iniettare uno storage fittizio. */
export function _setStorageForTesting(s: TStorageLike) {
  storage = s;
  useTemplatesStore.setState({ templates: readAll().result });
}

function readAll(): { result: TSavedTemplate[]; corrupted: boolean } {
  try {
    const raw = storage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      return { result: [], corrupted: false };
    }
    const parsed = z.array(SavedTemplateSchema).safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return { result: [], corrupted: true };
    }
    return { result: parsed.data as TSavedTemplate[], corrupted: false };
  } catch {
    return { result: [], corrupted: true };
  }
}

function writeAll(templates: TSavedTemplate[]) {
  storage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  useTemplatesStore.setState({ templates });
}

/** Store reattivo: le viste si aggiornano automaticamente a ogni modifica. */
export const useTemplatesStore = create<{ templates: TSavedTemplate[] }>(() => ({
  templates: readAll().result,
}));

export function useMyTemplates(): TSavedTemplate[] {
  return useTemplatesStore((s) => s.templates);
}

export function listTemplates(): TSavedTemplate[] {
  return useTemplatesStore.getState().templates;
}

/** true se i dati in localStorage erano corrotti e sono stati reimpostati. */
export function checkAndResetCorruptedStorage(): boolean {
  const { corrupted } = readAll();
  if (corrupted) {
    writeAll([]);
  }
  return corrupted;
}

export function getTemplate(id: string): TSavedTemplate | undefined {
  return listTemplates().find((t) => t.id === id);
}

export function saveTemplate(name: string, document: TEditorConfiguration, id?: string): TSavedTemplate {
  const now = new Date().toISOString();
  const templates = [...listTemplates()];
  if (id) {
    const index = templates.findIndex((t) => t.id === id);
    if (index >= 0) {
      const updated: TSavedTemplate = { ...templates[index], name, document, updatedAt: now };
      templates[index] = updated;
      writeAll(templates);
      return updated;
    }
  }
  const created: TSavedTemplate = {
    id: crypto.randomUUID(),
    name,
    document,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...templates, created]);
  return created;
}

export function renameTemplate(id: string, name: string): TSavedTemplate | undefined {
  const templates = listTemplates().map((t) =>
    t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t,
  );
  writeAll(templates);
  return templates.find((t) => t.id === id);
}

export function duplicateTemplate(id: string, copySuffix: string): TSavedTemplate | undefined {
  const source = getTemplate(id);
  if (!source) {
    return undefined;
  }
  return saveTemplate(`${source.name} ${copySuffix}`, source.document);
}

export function deleteTemplate(id: string) {
  writeAll(listTemplates().filter((t) => t.id !== id));
}

/** Ricerca case-insensitive sul nome, su prefatti e personali. */
export type TSearchResult = {
  kind: 'prefab' | 'saved';
  id: string;
  name: string;
};

export function searchTemplates(query: string, prefabs: { id: string; name: string }[]): TSearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }
  const fromPrefabs: TSearchResult[] = prefabs
    .filter((p) => p.name.toLowerCase().includes(q))
    .map((p) => ({ kind: 'prefab', id: p.id, name: p.name }));
  const fromSaved: TSearchResult[] = listTemplates()
    .filter((t) => t.name.toLowerCase().includes(q))
    .map((t) => ({ kind: 'saved', id: t.id, name: t.name }));
  return [...fromPrefabs, ...fromSaved];
}
