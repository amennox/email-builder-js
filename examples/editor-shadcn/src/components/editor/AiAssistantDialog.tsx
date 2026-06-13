/**
 * AiAssistantDialog — interfaccia per l'assistente AI dell'editor.
 *
 * NON è un chatbot: ogni richiesta è indipendente.
 * Flusso: input → loading → diff preview → conferma → applicato.
 * Le modifiche sono sempre reversibili con Cmd+Z.
 */

import { useState } from 'react';

import { AlertCircle, CheckCircle2, Info, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useDocument } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import type { TEditorConfiguration } from '@/documents/editor/core';
import {
  applyPatchOperations,
  AiUnavailableError,
  runAssistant,
  type PatchOperation,
} from '@/ai/assistantClient';

// ─── Costanti ─────────────────────────────────────────────────────────────────

type TQuickChip = { labelKey: string; prompt: string };

const QUICK_CHIPS: TQuickChip[] = [
  {
    labelKey: 'ai.assistant.chip.contrast',
    prompt:
      'Migliora il contrasto tra testo e sfondo in tutti i blocchi. Il testo deve essere leggibile con un rapporto WCAG di almeno 4.5:1.',
  },
  {
    labelKey: 'ai.assistant.chip.spacing',
    prompt:
      "Aumenta la spaziatura (padding) di tutti i Container e ColumnsContainer per un layout più aerato e professionale. Usa padding top/bottom di almeno 24px.",
  },
  {
    labelKey: 'ai.assistant.chip.dark',
    prompt:
      'Converti la palette in tonalità dark: sfondi scuri (#0f0f1a, #1a1a2e, #16213e), testi chiari (#f0f0f0, #e0e0e0), bottoni con colori vividi in contrasto.',
  },
  {
    labelKey: 'ai.assistant.chip.minimal',
    prompt:
      'Applica uno stile minimalista pulito: palette neutrale (bianco #ffffff, grigio chiaro #f8f8f8, grigio scuro #333333, nero #111111). Rimuovi colori vivaci.',
  },
];

// ─── Componenti interni ───────────────────────────────────────────────────────

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-sm border border-black/10"
      style={{ backgroundColor: color }}
    />
  );
}

function DiffRow({
  op,
  doc,
}: {
  op: PatchOperation;
  doc: TEditorConfiguration;
}) {
  const block = doc[op.blockId];
  const blockType = block?.type ?? '?';
  const data = (block?.data as Record<string, unknown>) ?? {};
  const fieldObj = (data[op.field] as Record<string, unknown>) ?? {};
  const before = fieldObj[op.key];

  const afterIsColor = typeof op.value === 'string' && HEX_COLOR_RE.test(op.value);
  const beforeIsColor = typeof before === 'string' && HEX_COLOR_RE.test(before);

  const afterDisplay =
    typeof op.value === 'object'
      ? JSON.stringify(op.value).slice(0, 24)
      : String(op.value).slice(0, 24);

  return (
    <div className="border-b px-3 py-2 last:border-0">
      {/* Riga 1: tipo blocco + label */}
      <div className="flex items-center gap-1.5">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {blockType}
        </span>
        <span className="min-w-0 truncate text-xs">{op.label || `${op.field}.${op.key}`}</span>
      </div>
      {/* Riga 2: before → after */}
      <div className="mt-1 flex items-center gap-1.5 pl-1 text-xs">
        {before !== undefined && (
          <span className="flex items-center gap-1 text-muted-foreground">
            {beforeIsColor && <ColorSwatch color={before as string} />}
            <span className="font-mono">{String(before).slice(0, 18)}</span>
          </span>
        )}
        {before !== undefined && <span className="text-muted-foreground">→</span>}
        <span className="flex items-center gap-1 font-medium">
          {afterIsColor && <ColorSwatch color={op.value as string} />}
          <span className="font-mono">{afterDisplay}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────

type TPhase = 'idle' | 'loading' | 'diff' | 'error';

export default function AiAssistantDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const document = useDocument();

  const [phase, setPhase] = useState<TPhase>('idle');
  const [request, setRequest] = useState('');
  const [summary, setSummary] = useState('');
  const [operations, setOperations] = useState<PatchOperation[]>([]);
  const [error, setError] = useState('');

  const reset = () => {
    setPhase('idle');
    setRequest('');
    setSummary('');
    setOperations([]);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = request.trim();
    if (!trimmed || phase === 'loading') return;
    setPhase('loading');
    setError('');
    try {
      const result = await runAssistant(trimmed, document);
      if (result.operations.length === 0) {
        setError(t('ai.assistant.noOps'));
        setPhase('error');
        return;
      }
      setSummary(result.summary);
      setOperations(result.operations);
      setPhase('diff');
    } catch (err) {
      setError(
        err instanceof AiUnavailableError
          ? t('ai.unavailable')
          : err instanceof Error
            ? err.message
            : t('ai.error'),
      );
      setPhase('error');
    }
  };

  const handleApply = () => {
    applyPatchOperations(operations);
    toast.success(t('ai.assistant.applied'));
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-violet-500" />
            <span>{t('ai.assistant.title')}</span>
            <Badge variant="secondary" className="text-[10px]">
              AI
            </Badge>

            {/* (i) info popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t('ai.assistant.infoLabel')}
                >
                  <Info className="size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="max-w-72 text-xs leading-relaxed"
              >
                <p className="font-medium mb-1">{t('ai.assistant.infoTitle')}</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {t('ai.assistant.info')}
                </p>
              </PopoverContent>
            </Popover>
          </DialogTitle>
        </DialogHeader>

        {/* ── FASE: INPUT ── */}
        {(phase === 'idle' || phase === 'error') && (
          <div className="space-y-3">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.labelKey}
                  onClick={() => setRequest(chip.prompt)}
                  className="rounded-full border bg-muted px-2.5 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {t(chip.labelKey as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={t('ai.assistant.placeholder')}
              className="min-h-[96px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  void handleSubmit();
                }
              }}
            />

            {/* Errore precedente */}
            {phase === 'error' && error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t('ai.assistant.hint')}
              </span>
              <Button
                size="sm"
                onClick={() => void handleSubmit()}
                disabled={!request.trim()}
              >
                <Sparkles className="size-3.5" />
                {t('ai.assistant.submit')}
              </Button>
            </div>
          </div>
        )}

        {/* ── FASE: LOADING ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-violet-500" />
            <p className="text-sm">{t('ai.assistant.loading')}</p>
          </div>
        )}

        {/* ── FASE: DIFF ── */}
        {phase === 'diff' && (
          <div className="space-y-3">
            {/* Summary AI */}
            <p className="text-sm text-muted-foreground">{summary}</p>

            {/* Lista modifiche */}
            <div className="overflow-hidden rounded-md border">
              <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
                <span className="text-xs font-medium">{t('ai.assistant.changesLabel')}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {operations.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-56">
                {operations.map((op, i) => (
                  <DiffRow key={i} op={op} doc={document} />
                ))}
              </ScrollArea>
            </div>

            {/* Hint undo */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-green-500" />
              {t('ai.assistant.undoHint')}
            </div>

            {/* Azioni */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                {t('ai.assistant.ignore')}
              </Button>
              <Button size="sm" onClick={handleApply}>
                {t('ai.assistant.apply')} ({operations.length})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
