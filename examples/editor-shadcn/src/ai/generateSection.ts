import { z } from 'zod';

import { EditorConfigurationSchema, TEditorBlock } from '../documents/editor/core';

import { aiChat } from './client';
import { buildGenerateSectionMessages } from './prompts/generateSection';

const ResponseShapeSchema = z.object({
  blocks: z.record(z.unknown()),
  order: z.array(z.string()).min(1),
});

export type TGeneratedSection = {
  /** Blocchi con id già rimappati (collision-free), pronti per setDocument. */
  blocks: Record<string, TEditorBlock>;
  /** Id radice (rimappati) da agganciare al contenitore di destinazione. */
  order: string[];
};

/** Rimappa gli id del frammento per evitare collisioni con il documento corrente. */
export function remapIds(blocks: Record<string, TEditorBlock>, order: string[], prefix: string): TGeneratedSection {
  const map = new Map<string, string>(Object.keys(blocks).map((id, i) => [id, `${prefix}-${i}`]));
  const remapList = (ids?: string[] | null) => ids?.map((id) => map.get(id) ?? id);

  const out: Record<string, TEditorBlock> = {};
  for (const [id, block] of Object.entries(blocks)) {
    const cloned = JSON.parse(JSON.stringify(block)) as TEditorBlock;
    const data = cloned.data as { props?: Record<string, unknown>; childrenIds?: string[] | null };
    if (Array.isArray(data?.childrenIds)) {
      data.childrenIds = remapList(data.childrenIds) ?? null;
    }
    const props = (cloned.data as { props?: Record<string, unknown> }).props;
    if (props) {
      if (Array.isArray(props.childrenIds)) {
        props.childrenIds = remapList(props.childrenIds as string[]);
      }
      if (Array.isArray(props.columns)) {
        props.columns = (props.columns as { childrenIds?: string[] }[]).map((c) => ({
          ...c,
          childrenIds: remapList(c.childrenIds) ?? [],
        }));
      }
    }
    out[map.get(id)!] = cloned;
  }
  return { blocks: out, order: order.map((id) => map.get(id) ?? id) };
}

/**
 * Valida il frammento montandolo in un documento fittizio: nessun blocco invalido
 * può mai entrare nel documento reale.
 */
export function validateFragment(raw: unknown): TGeneratedSection {
  const shape = ResponseShapeSchema.parse(raw);
  const probeDocument = {
    root: {
      type: 'EmailLayout',
      data: { childrenIds: shape.order },
    },
    ...(shape.blocks as Record<string, unknown>),
  };
  const parsed = EditorConfigurationSchema.parse(probeDocument);
  const { root: _root, ...blocks } = parsed as Record<string, TEditorBlock>;

  // ogni id referenziato deve esistere
  for (const id of shape.order) {
    if (!(id in blocks)) {
      throw new Error(`order references unknown block "${id}"`);
    }
  }
  return { blocks, order: shape.order };
}

export async function generateSection(userPrompt: string): Promise<TGeneratedSection> {
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const content = await aiChat(buildGenerateSectionMessages(userPrompt, lastError || undefined), {
      jsonResponse: true,
      temperature: 0.5,
    });
    try {
      const validated = validateFragment(JSON.parse(content));
      return remapIds(validated.blocks, validated.order, `ai-${Date.now()}`);
    } catch (err) {
      lastError = err instanceof Error ? err.message.slice(0, 400) : 'invalid JSON';
    }
  }
  throw new Error(`AI returned invalid structure: ${lastError}`);
}
