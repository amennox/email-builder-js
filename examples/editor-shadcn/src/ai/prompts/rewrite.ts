/**
 * Prompt: riscrittura testi dei blocchi email.
 * Tutti i prompt del progetto vivono in src/ai/prompts/ e sono versionati nel sorgente.
 */

export type TRewriteAction = 'improve' | 'formal' | 'persuasive' | 'shorten';

const ACTION_INSTRUCTIONS: Record<TRewriteAction, string> = {
  improve: 'Migliora il testo: più chiaro, scorrevole e professionale, senza cambiarne il significato.',
  formal: 'Riscrivi il testo con un tono più formale e cortese.',
  persuasive: 'Riscrivi il testo con un tono più persuasivo e orientato all’azione.',
  shorten: 'Accorcia il testo mantenendo il messaggio essenziale.',
};

export function buildRewriteMessages(text: string, action: TRewriteAction) {
  return [
    {
      role: 'system' as const,
      content:
        'Sei un copywriter esperto di email marketing. Rispondi SOLO con il testo riscritto, senza spiegazioni, virgolette o preamboli. ' +
        'Se il testo contiene markdown (grassetti **, link, elenchi), preserva esattamente la stessa formattazione. ' +
        'Mantieni la stessa lingua del testo originale.',
    },
    {
      role: 'user' as const,
      content: `${ACTION_INSTRUCTIONS[action]}\n\nTesto:\n${text}`,
    },
  ];
}
