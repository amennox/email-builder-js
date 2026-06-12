import { useMemo, useState } from 'react';

import { Info, SunMoon } from 'lucide-react';

import { Reader, renderToStaticMarkup } from '@/email';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useT } from '@/lib/i18n';

import EditorBlock from '@/documents/editor/EditorBlock';
import {
  setSelectedBlockId,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '@/documents/editor/EditorContext';
import { cn } from '@/lib/utils';

import EditorToolbar from './EditorToolbar';
import InspectorPanel from './InspectorPanel';
import HighlightedCodePanel from './helper/HighlightedCodePanel';

function HtmlPanel() {
  const document = useDocument();
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
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
          <div className={cn(frameClass, 'mt-3', darkSim && 'dark-email-sim')}>
            <Reader document={document} rootBlockId="root" />
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
