import { describe, expect, it } from 'vitest';

import { remapIds, validateFragment } from '../generateSection';
import type { TEditorBlock } from '../../documents/editor/core';

const VALID_FRAGMENT = {
  blocks: {
    s1: {
      type: 'Container',
      data: {
        style: { backgroundColor: '#E0F2FE', padding: { top: 16, bottom: 16, left: 24, right: 24 } },
        props: { childrenIds: ['s2', 's3'] },
      },
    },
    s2: { type: 'Heading', data: { props: { text: 'Offerte', level: 'h2' } } },
    s3: {
      type: 'Button',
      data: {
        props: { text: 'Acquista', url: 'https://example.com', buttonBackgroundColor: '#DC2626' },
      },
    },
  },
  order: ['s1'],
};

describe('validateFragment', () => {
  it('accetta un frammento valido', () => {
    const out = validateFragment(VALID_FRAGMENT);
    expect(out.order).toEqual(['s1']);
    expect(Object.keys(out.blocks).sort()).toEqual(['s1', 's2', 's3']);
  });

  it('rifiuta blocchi con type sconosciuto', () => {
    const bad = { blocks: { x: { type: 'Carousel', data: {} } }, order: ['x'] };
    expect(() => validateFragment(bad)).toThrow();
  });

  it('rifiuta order che punta a blocchi inesistenti', () => {
    const bad = { blocks: { s1: VALID_FRAGMENT.blocks.s2 }, order: ['missing'] };
    expect(() => validateFragment(bad)).toThrow();
  });

  it('rifiuta risposte senza order', () => {
    expect(() => validateFragment({ blocks: {} })).toThrow();
  });
});

describe('remapIds', () => {
  it('rimappa id e riferimenti childrenIds/columns', () => {
    const blocks = VALID_FRAGMENT.blocks as unknown as Record<string, TEditorBlock>;
    const { blocks: out, order } = remapIds(blocks, ['s1'], 'ai-test');
    expect(order).toEqual(['ai-test-0']);
    const container = out['ai-test-0'] as { data: { props: { childrenIds: string[] } } };
    expect(container.data.props.childrenIds).toEqual(['ai-test-1', 'ai-test-2']);
    expect(out['ai-test-1']).toBeDefined();
    // nessun id originale sopravvive
    expect(Object.keys(out).some((id) => id.startsWith('s'))).toBe(false);
  });
});
