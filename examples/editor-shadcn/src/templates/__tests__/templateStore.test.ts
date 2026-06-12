import { beforeEach, describe, expect, it } from 'vitest';

import WELCOME from '../../getConfiguration/sample/welcome';
import { PREFAB_TEMPLATES } from '../prefabs';
import {
  _setStorageForTesting,
  deleteTemplate,
  duplicateTemplate,
  getTemplate,
  listTemplates,
  renameTemplate,
  saveTemplate,
  searchTemplates,
  TEMPLATES_STORAGE_KEY,
} from '../templateStore';

function makeFakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    _dump: () => data,
  };
}

describe('templateStore', () => {
  beforeEach(() => {
    _setStorageForTesting(makeFakeStorage());
  });

  it('save → list → get round-trip identico', () => {
    const saved = saveTemplate('Il mio template', WELCOME);
    expect(listTemplates()).toHaveLength(1);
    const loaded = getTemplate(saved.id);
    expect(loaded?.name).toBe('Il mio template');
    expect(loaded?.document).toEqual(WELCOME);
  });

  it('save con id esistente sovrascrive e aggiorna updatedAt', () => {
    const first = saveTemplate('A', WELCOME);
    const second = saveTemplate('A rinominato', WELCOME, first.id);
    expect(second.id).toBe(first.id);
    expect(listTemplates()).toHaveLength(1);
    expect(getTemplate(first.id)?.name).toBe('A rinominato');
  });

  it('rename / duplicate / delete', () => {
    const tpl = saveTemplate('Originale', WELCOME);
    renameTemplate(tpl.id, 'Rinominato');
    expect(getTemplate(tpl.id)?.name).toBe('Rinominato');

    const copy = duplicateTemplate(tpl.id, '(copia)');
    expect(copy?.name).toBe('Rinominato (copia)');
    expect(listTemplates()).toHaveLength(2);

    deleteTemplate(tpl.id);
    expect(listTemplates()).toHaveLength(1);
    expect(getTemplate(tpl.id)).toBeUndefined();
  });

  it('storage corrotto → array vuoto', () => {
    _setStorageForTesting(makeFakeStorage({ [TEMPLATES_STORAGE_KEY]: '{broken' }));
    expect(listTemplates()).toEqual([]);
  });

  it('ricerca case-insensitive su prefatti e personali, soglia 2 caratteri', () => {
    saveTemplate('Newsletter Estate', WELCOME);
    expect(searchTemplates('w', PREFAB_TEMPLATES)).toEqual([]);
    const results = searchTemplates('WELC', PREFAB_TEMPLATES);
    expect(results.some((r) => r.kind === 'prefab' && r.name === 'Welcome email')).toBe(true);
    const mine = searchTemplates('estate', PREFAB_TEMPLATES);
    expect(mine).toHaveLength(1);
    expect(mine[0].kind).toBe('saved');
  });
});
