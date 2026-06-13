/**
 * LocalStorageRepository
 *
 * Implementazione di TemplateRepository basata su localStorage.
 * Mantiene un secondo bucket di versioni (max 50 per template, FIFO).
 */

import { z } from 'zod';

import { EditorConfigurationSchema, type TEditorConfiguration } from '../../documents/editor/core';
import type { TemplateRepository, TSavedTemplate, TTemplateVersion } from './types';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const TEMPLATES_KEY = 'emailbuilder:templates';
const VERSIONS_KEY = 'emailbuilder:versions';
const MAX_VERSIONS_PER_TEMPLATE = 50;

// ─── Zod schemas ─────────────────────────────────────────────────────────────
const SavedTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  document: EditorConfigurationSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TemplateVersionSchema = z.object({
  versionId: z.string(),
  templateId: z.string(),
  name: z.string(),
  document: EditorConfigurationSchema,
  savedAt: z.string(),
  versionNumber: z.number(),
});

// ─── Helper I/O ──────────────────────────────────────────────────────────────
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export class LocalStorageRepository implements TemplateRepository {
  private storage: StorageLike;

  constructor(storage: StorageLike = typeof localStorage !== 'undefined' ? localStorage : ({} as StorageLike)) {
    this.storage = storage;
  }

  // ── templates ───────────────────────────────────────────────────────────────

  private readTemplates(): TSavedTemplate[] {
    try {
      const raw = this.storage.getItem(TEMPLATES_KEY);
      if (!raw) return [];
      const parsed = z.array(SavedTemplateSchema).safeParse(JSON.parse(raw));
      return parsed.success ? (parsed.data as TSavedTemplate[]) : [];
    } catch {
      return [];
    }
  }

  private writeTemplates(templates: TSavedTemplate[]): void {
    this.storage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }

  async list(): Promise<TSavedTemplate[]> {
    return this.readTemplates();
  }

  async get(id: string): Promise<TSavedTemplate | undefined> {
    return this.readTemplates().find((t) => t.id === id);
  }

  async save(name: string, document: TEditorConfiguration, id?: string): Promise<TSavedTemplate> {
    const now = new Date().toISOString();
    const templates = [...this.readTemplates()];
    if (id) {
      const index = templates.findIndex((t) => t.id === id);
      if (index >= 0) {
        const prev = templates[index];
        const updated: TSavedTemplate = { ...prev, name, document, updatedAt: now };
        templates[index] = updated;
        this.writeTemplates(templates);
        // Crea una versione snapshot del contenuto precedente
        this.appendVersion(prev);
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
    this.writeTemplates([...templates, created]);
    return created;
  }

  async rename(id: string, name: string): Promise<TSavedTemplate | undefined> {
    const templates = this.readTemplates().map((t) =>
      t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t,
    );
    this.writeTemplates(templates);
    return templates.find((t) => t.id === id);
  }

  async duplicate(id: string, suffix: string): Promise<TSavedTemplate | undefined> {
    const source = this.readTemplates().find((t) => t.id === id);
    if (!source) return undefined;
    return this.save(`${source.name} ${suffix}`, source.document);
  }

  async delete(id: string): Promise<void> {
    this.writeTemplates(this.readTemplates().filter((t) => t.id !== id));
    // Rimuovi anche le versioni associate
    const versions = this.readVersions().filter((v) => v.templateId !== id);
    this.storage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  }

  // ── versions ─────────────────────────────────────────────────────────────────

  private readVersions(): TTemplateVersion[] {
    try {
      const raw = this.storage.getItem(VERSIONS_KEY);
      if (!raw) return [];
      const parsed = z.array(TemplateVersionSchema).safeParse(JSON.parse(raw));
      return parsed.success ? (parsed.data as TTemplateVersion[]) : [];
    } catch {
      return [];
    }
  }

  private appendVersion(template: TSavedTemplate): void {
    const all = this.readVersions();
    const forThisTemplate = all.filter((v) => v.templateId === template.id);
    const nextNumber = (forThisTemplate.at(-1)?.versionNumber ?? 0) + 1;
    const newVersion: TTemplateVersion = {
      versionId: crypto.randomUUID(),
      templateId: template.id,
      name: template.name,
      document: template.document,
      savedAt: new Date().toISOString(),
      versionNumber: nextNumber,
    };
    // FIFO: tieni solo le ultime MAX_VERSIONS_PER_TEMPLATE per questo template
    const kept = forThisTemplate.slice(-(MAX_VERSIONS_PER_TEMPLATE - 1));
    const others = all.filter((v) => v.templateId !== template.id);
    this.storage.setItem(VERSIONS_KEY, JSON.stringify([...others, ...kept, newVersion]));
  }

  async listVersions(templateId: string): Promise<TTemplateVersion[]> {
    return this.readVersions()
      .filter((v) => v.templateId === templateId)
      .sort((a, b) => b.versionNumber - a.versionNumber); // più recente prima
  }

  async getVersion(templateId: string, versionId: string): Promise<TTemplateVersion | undefined> {
    return this.readVersions().find((v) => v.templateId === templateId && v.versionId === versionId);
  }

  /** Metodo di test: inietta uno storage alternativo. */
  static forTesting(storage: StorageLike): LocalStorageRepository {
    return new LocalStorageRepository(storage);
  }
}

/** Istanza singleton (usata dall'app). */
export const localStorageRepository = new LocalStorageRepository();
