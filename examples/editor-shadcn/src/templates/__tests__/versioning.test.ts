import { describe, expect, it, beforeEach } from 'vitest';

import { _setStorageForTesting, deleteTemplate, listTemplateVersions, saveTemplate } from '../templateStore';

// Storage in-memory per i test
function makeMockStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
  };
}

// Documento email minimo valido
const DOC = {
  root: {
    type: 'EmailLayout',
    data: { childrenIds: [], canvasColor: '#FFF', textColor: '#000' },
  },
} as const;

const DOC_V2 = {
  root: {
    type: 'EmailLayout',
    data: { childrenIds: [], canvasColor: '#EEE', textColor: '#111' },
  },
} as const;

describe('Versioning template', () => {
  beforeEach(() => {
    _setStorageForTesting(makeMockStorage());
  });

  it('nessuna versione al primo salvataggio', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = saveTemplate('Template A', DOC as any);
    const versions = listTemplateVersions(tpl.id);
    expect(versions).toHaveLength(0);
  });

  it('crea una versione al secondo salvataggio (update)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = saveTemplate('Template A', DOC as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveTemplate('Template A', DOC_V2 as any, tpl.id);
    const versions = listTemplateVersions(tpl.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].versionNumber).toBe(1);
  });

  it('accumula versioni a ogni salvataggio', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = saveTemplate('Template A', DOC as any);
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveTemplate('Template A', DOC_V2 as any, tpl.id);
    }
    const versions = listTemplateVersions(tpl.id);
    expect(versions).toHaveLength(5);
  });

  it('le versioni sono ordinate dalla più recente', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = saveTemplate('Template A', DOC as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveTemplate('Template A', DOC as any, tpl.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveTemplate('Template A', DOC_V2 as any, tpl.id);
    const versions = listTemplateVersions(tpl.id);
    expect(versions[0].versionNumber).toBeGreaterThan(versions[1].versionNumber);
  });

  it('delete rimuove anche le versioni associate', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = saveTemplate('Template A', DOC as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveTemplate('Template A', DOC_V2 as any, tpl.id);
    deleteTemplate(tpl.id);
    const versions = listTemplateVersions(tpl.id);
    expect(versions).toHaveLength(0);
  });
});
