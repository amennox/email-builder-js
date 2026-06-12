import { useMemo, useState } from 'react';

import { CircleAlert, CircleCheck, ClipboardCheck } from 'lucide-react';

import { renderToStaticMarkup } from '@/email';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { setSelectedBlockId, setSelectedMainTab, useDocument } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import { runPreflight, type TPreflightIssue, type TPreflightRule } from '@/lib/preflight';
import type { TranslationKey } from '@/lib/i18n';

const RULE_LABEL: Record<TPreflightRule, TranslationKey> = {
  'missing-alt': 'preflight.missingAlt',
  'empty-href': 'preflight.emptyHref',
  'low-contrast': 'preflight.lowContrast',
  overweight: 'preflight.overweight',
};

function IssueRow({ issue, onGoTo }: { issue: TPreflightIssue; onGoTo: (blockId: string) => void }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <CircleAlert className="size-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{t(RULE_LABEL[issue.rule])}</p>
        {issue.detail && <p className="text-xs text-muted-foreground">{issue.detail}</p>}
      </div>
      {issue.blockId && (
        <Button variant="outline" size="sm" onClick={() => onGoTo(issue.blockId!)}>
          {t('preflight.goToBlock')}
        </Button>
      )}
    </div>
  );
}

export default function PreflightDialog() {
  const t = useT();
  const document = useDocument();
  const [open, setOpen] = useState(false);

  const issues = useMemo(() => {
    if (!open) {
      return [];
    }
    const html = renderToStaticMarkup(document, { rootBlockId: 'root' });
    return runPreflight(document, html);
  }, [open, document]);

  const handleGoTo = (blockId: string) => {
    setOpen(false);
    setSelectedMainTab('editor');
    setSelectedBlockId(blockId);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <ClipboardCheck />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('preflight.title')}</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-4" />
              {t('preflight.title')}
            </DialogTitle>
            <DialogDescription>{t('preflight.subtitle')}</DialogDescription>
          </DialogHeader>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-4 py-3 text-sm">
              <CircleCheck className="size-4 text-green-600" />
              {t('preflight.ok')}
            </div>
          ) : (
            <div className="max-h-80 divide-y overflow-y-auto rounded-md border">
              {issues.map((issue, i) => (
                <IssueRow key={i} issue={issue} onGoTo={handleGoTo} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
