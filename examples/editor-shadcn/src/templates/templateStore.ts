/**
 * templateStore.ts — store reattivo (Zustand) per i template personali.
 *
 * Tutte le funzioni sincrone restano compatibili con il codice esistente.
 * V2.5: aggiunto versioning automatico a ogni salvataggio (max 50 versioni/template).
 *
 * Per usare il backend HTTP: impostare VITE_TEMPLATE_BACKEND=http in .env.
 * In quel caso le operazioni async (loadFromServer / syncToServer) sono esposte
 * per uso futuro; lo store rimane comunque il source-of-truth nel client.
 */

import { z } from 'zod';
import { create } from 'zustand';

import { EditorConfigurationSchema, TEditorConfiguration } from '../documents/editor/core';
import type { TTemplateVersion } from './repository/types';

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export type TSavedTemplate = {
  id: string;
  name: string;
  document: TEditorConfiguration;
  createdAt: string;
  updatedAt: string;
};

// Re-esporta dal repository per i consumer che usano il tipo unificato
export type { TTemplateVersion } from './repository/types';

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const TEMPLATES_STORAGE_KEY = 'emailbuilder:templates';
const VERSIONS_STORAGE_KEY = 'emailbuilder:versions';
const MAX_VERSIONS = 50;

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const SavedTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  document: EditorConfigurationSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Le versioni usano uno schema più tollerante per il documento: la struttura
// può evolversi tra una versione e l'altra, l'importante è non perdere dati.
const VersionSchema = z.object({
  versionId: z.string(),
  templateId: z.string(),
  name: z.string(),
  document: z.record(z.string(), z.unknown()),
  savedAt: z.string(),
  versionNumber: z.number(),
});

// ─── Storage injection (test-friendly) ───────────────────────────────────────

type TStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

let storage: TStorageLike = typeof localStorage !== 'undefined' ? localStorage : ({} as TStorageLike);

/** Permette ai test di iniettare uno storage fittizio. */
export function _setStorageForTesting(s: TStorageLike) {
  storage = s;
  useTemplatesStore.setState({ templates: readAll().result });
  useVersionStore.setState({ versions: {} });
}

// ─── Template I/O ────────────────────────────────────────────────────────────

function readAll(): { result: TSavedTemplate[]; corrupted: boolean } {
  try {
    const raw = storage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return { result: [], corrupted: false };
    const parsed = z.array(SavedTemplateSchema).safeParse(JSON.parse(raw));
    if (!parsed.success) return { result: [], corrupted: true };
    return { result: parsed.data as TSavedTemplate[], corrupted: false };
  } catch {
    return { result: [], corrupted: true };
  }
}

function writeAll(templates: TSavedTemplate[]) {
  storage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  useTemplatesStore.setState({ templates });
}

// ─── Version I/O ─────────────────────────────────────────────────────────────

function readVersions(): TTemplateVersion[] {
  try {
    const raw = storage.getItem(VERSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = z.array(VersionSchema).safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as TTemplateVersion[]) : [];
  } catch {
    return [];
  }
}

function snapshotVersion(template: TSavedTemplate): void {
  const all = readVersions();
  const forThis = all.filter((v) => v.templateId === template.id);
  const nextNum = (forThis.at(-1)?.versionNumber ?? 0) + 1;
  const version: TTemplateVersion = {
    versionId: crypto.randomUUID(),
    templateId: template.id,
    name: template.name,
    document: template.document,
    savedAt: new Date().toISOString(),
    versionNumber: nextNum,
  };
  const kept = forThis.slice(-(MAX_VERSIONS - 1));
  const others = all.filter((v) => v.templateId !== template.id);
  storage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify([...others, ...kept, version]));
  useVersionStore.setState((s) => ({
    versions: {
      ...s.versions,
      [template.id]: [version, ...kept].sort((a, b) => b.versionNumber - a.versionNumber),
    },
  }));
}

// ─── Zustand stores ──────────────────────────────────────────────────────────

/** Store reattivo template: le viste si aggiornano automaticamente. */
export const useTemplatesStore = create<{ templates: TSavedTemplate[] }>(() => ({
  templates: readAll().result,
}));

/** Store reattivo versioni (lazy per template ID). */
export const useVersionStore = create<{ versions: Record<string, TTemplateVersion[]> }>(() => ({
  versions: {},
}));

// ─── API pubblica template (sincrona, retrocompatibile) ──────────────────────

export function useMyTemplates(): TSavedTemplate[] {
  return useTemplatesStore((s) => s.templates);
}

export function listTemplates(): TSavedTemplate[] {
  return useTemplatesStore.getState().templates;
}

/** true se i dati in localStorage erano corrotti e sono stati reimpostati. */
export function checkAndResetCorruptedStorage(): boolean {
  const { corrupted } = readAll();
  if (corrupted) writeAll([]);
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
      const prev = templates[index];
      // Snapshot versione precedente PRIMA di sovrascrivere
      snapshotVersion(prev);
      const updated: TSavedTemplate = { ...prev, name, document, updatedAt: now };
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
  if (!source) return undefined;
  return saveTemplate(`${source.name} ${copySuffix}`, source.document);
}

export function deleteTemplate(id: string) {
  writeAll(listTemplates().filter((t) => t.id !== id));
  // Rimuovi versioni associate
  const remaining = readVersions().filter((v) => v.templateId !== id);
  storage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(remaining));
  useVersionStore.setState((s) => {
    const next = { ...s.versions };
    delete next[id];
    return { versions: next };
  });
}

// ─── API versioni ─────────────────────────────────────────────────────────────

/**
 * Restituisce le versioni di un template (dalla più recente).
 * Prima chiamata: carica da storage. Poi usa lo store reattivo.
 */
export function listTemplateVersions(templateId: string): TTemplateVersion[] {
  const cached = useVersionStore.getState().versions[templateId];
  if (cached) return cached;
  const all = readVersions()
    .filter((v) => v.templateId === templateId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
  useVersionStore.setState((s) => ({
    versions: { ...s.versions, [templateId]: all },
  }));
  return all;
}

export function useTemplateVersions(templateId: string): TTemplateVersion[] {
  // Assicura il caricamento iniziale
  listTemplateVersions(templateId);
  return useVersionStore((s) => s.versions[templateId] ?? []);
}

export function getTemplateVersion(
  templateId: string,
  versionId: string,
): TTemplateVersion | undefined {
  return readVersions().find((v) => v.templateId === templateId && v.versionId === versionId);
}

/**
 * Ripristina una versione: crea un nuovo salvataggio con i dati della versione
 * (non distruttivo: la versione originale non viene rimossa).
 */
export function restoreVersion(templateId: string, versionId: string): TSavedTemplate | undefined {
  const version = getTemplateVersion(templateId, versionId);
  if (!version) return undefined;
  const current = getTemplate(templateId);
  if (!current) return undefined;
  return saveTemplate(version.name, version.document, templateId);
}

// ─── Ricerca ─────────────────────────────────────────────────────────────────

export type TSearchResult = {
  kind: 'prefab' | 'saved';
  id: string;
  name: string;
};

export function searchTemplates(query: string, prefabs: { id: string; name: string }[]): TSearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const fromPrefabs: TSearchResult[] = prefabs
    .filter((p) => p.name.toLowerCase().includes(q))
    .map((p) => ({ kind: 'prefab', id: p.id, name: p.name }));
  const fromSaved: TSearchResult[] = listTemplates()
    .filter((t) => t.name.toLowerCase().includes(q))
    .map((t) => ({ kind: 'saved', id: t.id, name: t.name }));
  return [...fromPrefabs, ...fromSaved];
}
