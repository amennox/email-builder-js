import type { TEditorConfiguration } from '../../documents/editor/core';

export type TSavedTemplate = {
  id: string;
  name: string;
  document: TEditorConfiguration;
  createdAt: string;
  updatedAt: string;
};

export type TTemplateVersion = {
  versionId: string;
  templateId: string;
  name: string;
  document: TEditorConfiguration;
  savedAt: string;
  /** Numero versione (1 = prima versione, crescente) */
  versionNumber: number;
};

/**
 * Interfaccia Repository per i template.
 * Entrambe le implementazioni (LocalStorageRepository e HttpRepository)
 * devono rispettare questo contratto — le viste non sanno da dove arrivano i dati.
 */
export interface TemplateRepository {
  list(): Promise<TSavedTemplate[]>;
  get(id: string): Promise<TSavedTemplate | undefined>;
  save(name: string, document: TEditorConfiguration, id?: string): Promise<TSavedTemplate>;
  rename(id: string, name: string): Promise<TSavedTemplate | undefined>;
  duplicate(id: string, suffix: string): Promise<TSavedTemplate | undefined>;
  delete(id: string): Promise<void>;

  /** Versioni del template (dalla più recente alla più vecchia). */
  listVersions(templateId: string): Promise<TTemplateVersion[]>;
  /** Restituisce una versione specifica. */
  getVersion(templateId: string, versionId: string): Promise<TTemplateVersion | undefined>;
}
