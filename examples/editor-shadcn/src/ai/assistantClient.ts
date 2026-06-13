/**
 * Client per l'assistente AI dell'editor.
 *
 * Flusso:
 *   1. runAssistant(request, doc) → chiama il proxy AI con il system prompt + documento
 *   2. L'AI ritorna un JSON con un array di PatchOperation
 *   3. applyPatchOperations(ops) applica le operazioni al documento tramite setDocument
 *      (registrato nello storico undo/redo di zundo)
 */

import { z } from 'zod';

import type { TEditorConfiguration } from '@/documents/editor/core';
import { getEditorState, setDocument } from '@/documents/editor/EditorContext';

import { aiChat, AiUnavailableError } from './client';
import { buildAssistantSystemPrompt } from './prompts/assistantSystemPrompt';

export { AiUnavailableError };

// ─── Tipi ────────────────────────────────────────────────────────────────────

export type PatchOperation = {
  blockId: string;
  field: 'style' | 'props';
  key: string;
  value: unknown;
  label: string;
};

export type AssistantResult = {
  summary: string;
  operations: PatchOperation[];
};

// ─── Zod schema ───────────────────────────────────────────────────────────────

const OperationSchema = z.object({
  blockId: z.string(),
  field: z.enum(['style', 'props']),
  key: z.string().min(1),
  value: z.unknown(),
  label: z.string().default(''),
});

const AssistantResponseSchema = z.object({
  summary: z.string(),
  operations: z.array(OperationSchema),
});

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Estrae JSON da una risposta AI che potrebbe contenere markdown code fences. */
function extractJson(raw: string): string {
  const match = /```(?:json)?\s*([\s\S]*?)```/m.exec(raw);
  return match ? match[1].trim() : raw.trim();
}

// ─── API pubblica ─────────────────────────────────────────────────────────────

/**
 * Invia la richiesta dell'utente al proxy AI.
 * Ritorna il summary e le operazioni validate (blockId verificati nel documento).
 */
export async function runAssistant(
  request: string,
  doc: TEditorConfiguration,
): Promise<AssistantResult> {
  const systemPrompt = buildAssistantSystemPrompt(doc);

  const raw = await aiChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: request },
    ],
    { jsonResponse: true, temperature: 0.2 },
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error('La risposta AI non è un JSON valido.');
  }

  const result = AssistantResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Struttura risposta AI non valida. Riprova.');
  }

  // Filtra operazioni con blockId non presenti nel documento corrente
  const validOps = result.data.operations.filter((op) => op.blockId in doc);

  return {
    summary: result.data.summary,
    operations: validOps as PatchOperation[],
  };
}

/**
 * Applica le operazioni al documento via setDocument.
 * Il cambiamento viene registrato nello storico undo/redo (zundo).
 */
export function applyPatchOperations(operations: PatchOperation[]): void {
  const doc = getEditorState().document;
  const updates: TEditorConfiguration = {};

  for (const op of operations) {
    const block = doc[op.blockId];
    if (!block) continue;

    // Accumula più operazioni sullo stesso blocco prima di scrivere
    const base = updates[op.blockId] ?? block;
    const blockData = (base.data as Record<string, unknown>) ?? {};
    const fieldObj = (blockData[op.field] as Record<string, unknown>) ?? {};

    updates[op.blockId] = {
      ...base,
      data: {
        ...blockData,
        [op.field]: {
          ...fieldObj,
          [op.key]: op.value,
        },
      },
    };
  }

  // setDocument fa merge shallow: i blocchi non toccati rimangono invariati
  setDocument(updates);
}
