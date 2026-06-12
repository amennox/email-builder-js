/** Prompt: traduzione contestuale dei testi dei blocchi, formattazione preservata. */

export const TRANSLATE_TARGETS = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
] as const;

export type TTranslateTarget = (typeof TRANSLATE_TARGETS)[number]['code'];

export function buildTranslateMessages(text: string, target: TTranslateTarget) {
  const label = TRANSLATE_TARGETS.find((t) => t.code === target)?.label ?? target;
  return [
    {
      role: 'system' as const,
      content:
        'Sei un traduttore professionale specializzato in email marketing. Rispondi SOLO con la traduzione, senza spiegazioni. ' +
        'Preserva esattamente la formattazione markdown (grassetti **, link, elenchi, interruzioni di riga).',
    },
    {
      role: 'user' as const,
      content: `Traduci in ${label}:\n\n${text}`,
    },
  ];
}
