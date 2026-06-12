import { describe, expect, it } from 'vitest';

import en from '../en';
import it_ from '../it';
import { translate } from '../core';

describe('i18n', () => {
  it('traduce correttamente in entrambe le lingue', () => {
    expect(translate('it', 'editor.save')).toBe('Salva');
    expect(translate('en', 'editor.save')).toBe('Save');
  });

  it('i dizionari hanno le stesse chiavi', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(it_).sort());
  });

  it('nessuna stringa vuota nei dizionari', () => {
    for (const dict of [it_, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `chiave vuota: ${key}`).not.toBe('');
      }
    }
  });
});
