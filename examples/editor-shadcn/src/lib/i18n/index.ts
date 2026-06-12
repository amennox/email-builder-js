import { useCallback } from 'react';

import { useLocale } from '../../documents/editor/EditorContext';

import { translate, type TranslationKey } from './core';

export * from './core';

/**
 * Hook di traduzione: restituisce `t(key)` legata alla lingua corrente dello store.
 */
export function useT() {
  const locale = useLocale();
  return useCallback((key: TranslationKey) => translate(locale, key), [locale]);
}
