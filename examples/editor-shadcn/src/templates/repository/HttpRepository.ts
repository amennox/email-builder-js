/**
 * HttpRepository
 *
 * Implementazione di TemplateRepository che chiama un backend REST.
 * Endpoint attesi (tutti JSON):
 *   GET    /templates                        → TSavedTemplate[]
 *   GET    /templates/:id                    → TSavedTemplate
 *   POST   /templates          body: {name, document}              → TSavedTemplate
 *   PUT    /templates/:id      body: {name?, document?}            → TSavedTemplate
 *   DELETE /templates/:id                                          → 204
 *   GET    /templates/:id/versions                                 → TTemplateVersion[]
 *   GET    /templates/:id/versions/:versionId                      → TTemplateVersion
 *
 * L'URL base si configura via VITE_TEMPLATE_API_URL (default: http://localhost:8788).
 */

import type { TEditorConfiguration } from '../../documents/editor/core';
import type { TemplateRepository, TSavedTemplate, TTemplateVersion } from './types';

const DEFAULT_BASE_URL = 'http://localhost:8788';

export class HttpRepository implements TemplateRepository {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_TEMPLATE_API_URL ?? DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
    if (res.status === 204) return undefined as T;
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async list(): Promise<TSavedTemplate[]> {
    return this.request<TSavedTemplate[]>('/templates');
  }

  async get(id: string): Promise<TSavedTemplate | undefined> {
    try {
      return await this.request<TSavedTemplate>(`/templates/${id}`);
    } catch {
      return undefined;
    }
  }

  async save(name: string, document: TEditorConfiguration, id?: string): Promise<TSavedTemplate> {
    if (id) {
      return this.request<TSavedTemplate>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, document }),
      });
    }
    return this.request<TSavedTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify({ name, document }),
    });
  }

  async rename(id: string, name: string): Promise<TSavedTemplate | undefined> {
    return this.request<TSavedTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async duplicate(id: string, suffix: string): Promise<TSavedTemplate | undefined> {
    return this.request<TSavedTemplate>(`/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ suffix }),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/templates/${id}`, { method: 'DELETE' });
  }

  async listVersions(templateId: string): Promise<TTemplateVersion[]> {
    return this.request<TTemplateVersion[]>(`/templates/${templateId}/versions`);
  }

  async getVersion(templateId: string, versionId: string): Promise<TTemplateVersion | undefined> {
    try {
      return await this.request<TTemplateVersion>(`/templates/${templateId}/versions/${versionId}`);
    } catch {
      return undefined;
    }
  }
}
