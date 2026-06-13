import { useMemo, useState } from 'react';

import { AlertCircle, Info, SunMoon } from 'lucide-react';

import { Reader, renderToStaticMarkup } from '@/email';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { renderToMjmlString, mjmlToHtml } from '@/mjml';
import { useT } from '@/lib/i18n';

import EditorBlock from '@/documents/editor/EditorBlock';
import {
  setSelectedBlockId,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '@/documents/editor/EditorContext';
import { resolveVariables, useVariablesStore } from '@/documents/variables';
import { cn } from '@/lib/utils';

import EditorToolbar from './EditorToolbar';
import InspectorPanel from './InspectorPanel';
import HighlightedCodePanel from './helper/HighlightedCodePanel';

function HtmlPanel() {
  const t = useT();
  const document = useDocument();
  const [useMjml, setUseMjml] = useState(false);
  const [mjmlHtml, setMjmlHtml] = useState<string | null>(null);
  const [mjmlErrors, setMjmlErrors] = useState<string[]>([]);
  const [mjmlLoading, setMjmlLoading] = useState(false);

  const classicHtml = useMemo(
    () => renderToStaticMarkup(document, { rootBlockId: 'root' }),
    [document],
  );

  const handleToggleMjml = async (val: boolean) => {
    setUseMjml(val);
    if (val) {
      setMjmlLoading(true);
      setMjmlErrors([]);
      try {
        const mjmlStr = renderToMjmlString(document);
        const result = await mjmlToHtml(mjmlStr);
        setMjmlHtml(result.html);
        setMjmlErrors(result.errors.filter((e) => e.severity > 0).map((e) => e.message));
      } catch (err) {
        setMjmlErrors([String(err)]);
        setMjmlHtml(null);
      } finally {
        setMjmlLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <Label htmlFor="mjml-toggle" className="text-xs text-muted-foreground select-none">
          {t('html.renderer.classic')}
        </Label>
        <Switch id="mjml-toggle" checked={useMjml} onCheckedChange={(v) => void handleToggleMjml(v)} />
        <Label htmlFor="mjml-toggle" className="text-xs font-medium select-none">
          {t('html.renderer.mjml')}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          MJML 4
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="size-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-72">{t('html.renderer.mjmlInfo')}</TooltipContent>
        </Tooltip>
      </div>
      {mjmlErrors.length > 0 && (
        <div className="flex items-start gap-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div>
            {mjmlErrors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        </div>
      )}
      {mjmlLoading ? (
        <p className="p-4 text-sm text-muted-foreground">{t('html.renderer.mjmlLoading')}</p>
      ) : (
        <HighlightedCodePanel type="html" value={useMjml && mjmlHtml !== null ? mjmlHtml : classicHtml} />
      )}
    </div>
  );
}

function JsonPanel() {
  const document = useDocument();
  const code = useMemo(() => JSON.stringify(document, null, 2), [document]);
  return <HighlightedCodePanel type="json" value={code} />;
}

function MainPanel() {
  const t = useT();
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const [darkSim, setDarkSim] = useState(false);
  const { testValues, previewActive } = useVariablesStore();

  // Documento con variabili sostituite (solo per preview)
  const previewDocument = useMemo(
    () => (previewActive ? resolveVariables(document, testValues) : document),
    [document, testValues, previewActive],
  );

  const frameClass = cn(
    'mx-auto my-8 overflow-hidden rounded-lg border bg-white shadow-sm',
    selectedScreenSize === 'mobile' ? 'w-[370px]' : 'w-full max-w-[600px]',
  );

  switch (selectedMainTab) {
    case 'editor':
      return (
        <div className={frameClass}>
          <EditorBlock id="root" />
        </div>
      );
    case 'preview':
      return (
        <>
          <div
            className={cn(
              'mx-auto mt-6 flex items-center justify-center gap-2',
              selectedScreenSize === 'mobile' ? 'w-[370px]' : 'w-full max-w-[600px]',
            )}
            onClick={(ev) => ev.stopPropagation()}
          >
            <SunMoon className="size-4 text-muted-foreground" />
            <Label htmlFor="dark-sim" className="text-xs text-muted-foreground">
              {t('preview.darkToggle')}
            </Label>
            <Switch id="dark-sim" checked={darkSim} onCheckedChange={setDarkSim} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">{t('preview.darkInfo')}</TooltipContent>
            </Tooltip>
          </div>
          {/* Usa previewDocument: variabili {{var}} sostituite se previewActive */}
          <div className={cn(frameClass, 'mt-3', darkSim && 'dark-email-sim')}>
            <Reader document={previewDocument} rootBlockId="root" />
          </div>
        </>
      );
    case 'html':
      return (
        <div className="mx-6 my-8 overflow-hidden rounded-lg border bg-card">
          <HtmlPanel />
        </div>
      );
    case 'json':
      return (
        <div className="mx-6 my-8 overflow-hidden rounded-lg border bg-card">
          <JsonPanel />
        </div>
      );
  }
}

export default function EditorView() {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <EditorToolbar />
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto bg-muted/40" onClick={() => setSelectedBlockId(null)}>
          <MainPanel />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
}
