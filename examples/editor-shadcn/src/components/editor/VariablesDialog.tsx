/**
 * VariablesDialog — gestione delle variabili dinamiche {{nome_variabile}}.
 *
 * Mostra le variabili rilevate nel template, permette di impostare valori di test
 * e di attivare/disattivare la sostituzione in anteprima.
 * L'esportazione (ZIP / JSON) conserva sempre la sintassi {{var}} originale.
 */

import { useMemo, useState } from 'react';

import { Braces, Info, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { aiChat, AiUnavailableError } from '@/ai/client';
import { useDocument } from '@/documents/editor/EditorContext';
import { extractVariables, useVariablesStore } from '@/documents/variables';
import { useT } from '@/lib/i18n';

// ─── Funzione AI per popolare i valori ───────────────────────────────────────

/** Estrae testo grezzo dal documento per dare contesto all'AI. */
function extractDocumentText(doc: Record<string, unknown>): string {
  const snippets: string[] = [];
  for (const block of Object.values(doc)) {
    const data = (block as { data?: Record<string, unknown> }).data ?? {};
    const props = (data.props as Record<string, unknown>) ?? {};
    for (const val of Object.values(props)) {
      if (typeof val === 'string' && val.trim().length > 2) {
        snippets.push(val.slice(0, 120));
      }
    }
  }
  return snippets.slice(0, 20).join(' | ');
}

/**
 * Chiede all'AI valori di test verosimili per le variabili fornite.
 * L'AI inferisce lingua e contesto dal testo del template.
 */
async function suggestVariableValues(
  variables: string[],
  docText: string,
): Promise<Record<string, string>> {
  const system = `You are a test-data generator for email templates.
Given a list of variable names and template text snippets for context, return a JSON object { "varName": "value" } with realistic test values.
Rules:
- Detect the template language from the text and use THAT language for string values (e.g. Italian text → Italian values)
- Infer the context (hotel booking, ecommerce order, newsletter, event, etc.) from the template text
- Generate plausible, realistic values matching each variable name and context
- Dates → YYYY-MM-DD, times → HH:MM, numbers as plain numeric strings
- Keep values short (1–4 words max for names/labels)
- Return ONLY the JSON object, no explanations, no markdown`;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const user = `Today's date: ${today}\nVariables: ${variables.join(', ')}\nTemplate context: ${docText || '(no text found)'}`;

  const raw = await aiChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { jsonResponse: true, temperature: 0.4 },
  );

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
  } catch {
    /* fallback: ritorna vuoto */
  }
  return {};
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function VariablesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const document = useDocument();
  const { testValues, previewActive, setTestValue, setPreviewActive } = useVariablesStore();
  const [populating, setPopulating] = useState(false);
  const [populateError, setPopulateError] = useState<string | null>(null);

  const variables = useMemo(() => extractVariables(document), [document]);

  const handlePopulate = async () => {
    setPopulating(true);
    setPopulateError(null);
    try {
      const docText = extractDocumentText(document as Record<string, unknown>);
      const suggested = await suggestVariableValues(variables, docText);
      for (const [name, value] of Object.entries(suggested)) {
        if (variables.includes(name) && typeof value === 'string') {
          setTestValue(name, value);
        }
      }
    } catch (err) {
      if (err instanceof AiUnavailableError) {
        setPopulateError(t('ai.unavailable'));
      } else {
        setPopulateError(t('ai.error'));
      }
    } finally {
      setPopulating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        {/* Header — pr-8 evita che il pulsante (i) si sovrapponga alla X di chiusura */}
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Braces className="size-4 shrink-0" />
            <span>{t('variables.title')}</span>
            {variables.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {variables.length}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t('variables.infoLabel')}
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-64">
                {t('variables.info')}
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">{t('variables.description')}</p>

        {variables.length === 0 ? (
          /* Nessuna variabile rilevata */
          <div className="rounded-md border bg-muted/40 px-4 py-6 text-center">
            <Braces className="mx-auto mb-2 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('variables.none')}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {t('variables.noneHint')}
            </p>
          </div>
        ) : (
          /* Lista variabili rilevate */
          <div className="space-y-2">
            {variables.map((name) => (
              <div key={name} className="flex items-center gap-3">
                <code className="w-36 shrink-0 truncate rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                  {`{{${name}}}`}
                </code>
                <Input
                  value={testValues[name] ?? ''}
                  onChange={(e) => setTestValue(name, e.target.value)}
                  placeholder={t('variables.placeholder')}
                  className="h-8 text-xs"
                />
              </div>
            ))}

            {/* Errore populate */}
            {populateError && (
              <p className="text-xs text-destructive">{populateError}</p>
            )}

            {/* Pulsante AI populate */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => void handlePopulate()}
              disabled={populating}
            >
              <Sparkles className="size-3.5" />
              {populating ? t('variables.populating') : t('variables.populate')}
            </Button>

            {/* Toggle preview */}
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <Switch
                id="var-preview-toggle"
                checked={previewActive}
                onCheckedChange={setPreviewActive}
              />
              <Label htmlFor="var-preview-toggle" className="text-xs cursor-pointer">
                {t('variables.previewToggle')}
              </Label>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('variables.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
