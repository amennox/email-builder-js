export type { TemplateRepository, TSavedTemplate, TTemplateVersion } from './types';
export { LocalStorageRepository, localStorageRepository } from './LocalStorageRepository';
export { HttpRepository } from './HttpRepository';

/**
 * Repository attivo nell'app.
 *
 * Selezionato in base a VITE_TEMPLATE_BACKEND:
 *   - 'http'  → HttpRepository (punta a VITE_TEMPLATE_API_URL)
 *   - tutto il resto → LocalStorageRepository (default)
 *
 * In piattaforma basterà impostare VITE_TEMPLATE_BACKEND=http
 * e VITE_TEMPLATE_API_URL=https://api.piattaforma.com
 * senza toccare nessun altro file.
 */
import { HttpRepository } from './HttpRepository';
import { LocalStorageRepository } from './LocalStorageRepository';
import type { TemplateRepository } from './types';

function createRepository(): TemplateRepository {
  if (import.meta.env.VITE_TEMPLATE_BACKEND === 'http') {
    return new HttpRepository();
  }
  return new LocalStorageRepository();
}

export const repository: TemplateRepository = createRepository();
