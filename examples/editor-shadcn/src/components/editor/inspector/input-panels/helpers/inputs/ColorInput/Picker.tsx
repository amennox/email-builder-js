/**
 * Picker colore avanzato con 4 tab:
 *   1. Selettore  — gradiente HSV + input hex
 *   2. Progetto   — colori estratti dal documento corrente
 *   3. Armonia    — colori armonici calcolati algoritmicamente
 *   4. AI         — suggerimento AI contestuale
 */

import { useState } from 'react';

import { HexColorInput, HexColorPicker } from 'react-colorful';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiUnavailableError, suggestColor } from '@/ai/colorSuggestion';
import { useDocument } from '@/documents/editor/EditorContext';
import { computeHarmonyColors, extractProjectColors } from '@/lib/colorUtils';
import { useT } from '@/lib/i18n';

import Swatch from './Swatch';

// ─── Tab: Selettore ───────────────────────────────────────────────────────────

function TabPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3 [&_.react-colorful]:h-auto [&_.react-colorful]:w-full [&_.react-colorful__hue]:mt-2 [&_.react-colorful__hue]:h-3 [&_.react-colorful__hue]:rounded-sm [&_.react-colorful__pointer]:size-4 [&_.react-colorful__saturation]:h-36 [&_.react-colorful__saturation]:rounded-sm">
      <HexColorPicker color={value} onChange={onChange} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Hex</span>
        <HexColorInput
          prefixed
          color={value}
          onChange={onChange}
          className="border-input h-8 w-full rounded-md border bg-transparent px-2 font-mono text-xs shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
    </div>
  );
}

// ─── Tab: Progetto ────────────────────────────────────────────────────────────

function TabProject({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const document = useDocument();
  const colors = extractProjectColors(document as Record<string, unknown>);

  if (colors.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        {t('color.project.empty')}
      </p>
    );
  }

  return <Swatch paletteColors={colors} value={value} onChange={onChange} />;
}

// ─── Tab: Armonia ─────────────────────────────────────────────────────────────

const HARMONY_KEY_MAP: Record<string, string> = {
  complementary: 'color.harmony.complementary',
  splitComp: 'color.harmony.splitComp',
  analogous: 'color.harmony.analogous',
  triadic: 'color.harmony.triadic',
  tints: 'color.harmony.tints',
  shades: 'color.harmony.shades',
};

function TabHarmony({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const groups = computeHarmonyColors(value);

  if (groups.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Inserisci un colore valido nella tab Selettore.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {groups.map((g) => (
        <div key={g.key}>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t(HARMONY_KEY_MAP[g.key] as Parameters<typeof t>[0])}
          </p>
          <Swatch paletteColors={g.colors} value={value} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

// ─── Tab: AI ──────────────────────────────────────────────────────────────────

function TabAi({
  value,
  onChange,
  fieldLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  fieldLabel: string;
}) {
  const t = useT();
  const document = useDocument();
  const projectColors = extractProjectColors(document as Record<string, unknown>);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ color: string; reason: string } | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await suggestColor({
        fieldLabel,
        currentColor: value,
        projectColors,
      });
      setSuggestion(result);
    } catch (err) {
      setError(
        err instanceof AiUnavailableError ? t('ai.unavailable') : t('color.ai.error'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Contesto */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">{t('color.ai.element')}</span>
          <span>{fieldLabel}</span>
        </div>
        {projectColors.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-muted-foreground font-medium">{t('color.ai.palette')}</p>
            <div className="flex flex-wrap gap-1">
              {projectColors.map((c) => (
                <span
                  key={c}
                  className="size-4 rounded-sm border"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pulsante */}
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5"
        onClick={() => void handleSuggest()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            {t('color.ai.suggesting')}
          </>
        ) : (
          t('color.ai.suggest')
        )}
      </Button>

      {/* Errore */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Risultato */}
      {suggestion && (
        <div className="space-y-2 rounded-md border p-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className="size-8 shrink-0 rounded-md border shadow-xs"
              style={{ backgroundColor: suggestion.color }}
            />
            <div className="min-w-0">
              <p className="font-mono text-xs font-medium">{suggestion.color}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{suggestion.reason}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => onChange(suggestion.color)}
          >
            {t('color.ai.use')}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Picker principale ────────────────────────────────────────────────────────

type Props = {
  value: string;
  onChange: (v: string) => void;
  fieldLabel?: string;
};

export default function Picker({ value, onChange, fieldLabel = '' }: Props) {
  const t = useT();

  return (
    <Tabs defaultValue="picker" className="w-56">
      <TabsList className="mb-2 h-7 w-full rounded-sm">
        <TabsTrigger value="picker" className="h-5 flex-1 text-[10px]">
          {t('color.tab.picker')}
        </TabsTrigger>
        <TabsTrigger value="project" className="h-5 flex-1 text-[10px]">
          {t('color.tab.project')}
        </TabsTrigger>
        <TabsTrigger value="harmony" className="h-5 flex-1 text-[10px]">
          {t('color.tab.harmony')}
        </TabsTrigger>
        <TabsTrigger value="ai" className="h-5 flex-1 text-[10px]">
          {t('color.tab.ai')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="picker" className="mt-0">
        <TabPicker value={value} onChange={onChange} />
      </TabsContent>

      <TabsContent value="project" className="mt-0">
        <TabProject value={value} onChange={onChange} />
      </TabsContent>

      <TabsContent value="harmony" className="mt-0">
        <TabHarmony value={value} onChange={onChange} />
      </TabsContent>

      <TabsContent value="ai" className="mt-0">
        <TabAi value={value} onChange={onChange} fieldLabel={fieldLabel} />
      </TabsContent>
    </Tabs>
  );
}
