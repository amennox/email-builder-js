import { Clock, History, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocale } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import {
  restoreVersion,
  useTemplateVersions,
  type TSavedTemplate,
  type TTemplateVersion,
} from '@/templates/templateStore';

import { openTemplate } from '../shell/navigation';
import { TemplateThumbnail } from './TemplateCard';

// ─── Componenti interni ───────────────────────────────────────────────────────

function VersionRow({
  version,
  locale,
  onRestore,
}: {
  version: TTemplateVersion;
  locale: string;
  onRestore: (v: TTemplateVersion) => void;
}) {
  const t = useT();
  const date = new Date(version.savedAt).toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="group flex items-center gap-3 px-4 py-3">
      {/* Miniatura */}
      <div className="size-16 shrink-0 overflow-hidden rounded border bg-muted/40">
        <TemplateThumbnail document={version.document} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{version.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {date}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('versions.versionLabel')} {version.versionNumber}
        </p>
      </div>

      {/* Azioni */}
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onRestore(version)}
      >
        <RotateCcw className="size-3.5" />
        {t('versions.restore')}
      </Button>
    </div>
  );
}

// ─── Dialog principale ────────────────────────────────────────────────────────

type VersionHistoryPanelProps = {
  template: TSavedTemplate;
  open: boolean;
  onClose: () => void;
};

export function VersionHistoryPanel({ template, open, onClose }: VersionHistoryPanelProps) {
  const t = useT();
  const locale = useLocale();
  const versions = useTemplateVersions(template.id);

  const handleRestore = (version: TTemplateVersion) => {
    restoreVersion(template.id, version.versionId);
    toast.success(t('versions.restored'));
    // Apri il template nell'editor (ora ha i dati della versione)
    openTemplate('saved', template.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4" />
            {t('versions.title')}
          </DialogTitle>
          <DialogDescription>{template.name}</DialogDescription>
        </DialogHeader>

        {versions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border bg-muted/30 py-8 text-center">
            <History className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('versions.empty')}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[480px]">
            <div className="divide-y">
              {versions.map((v) => (
                <div key={v.versionId}>
                  <VersionRow version={v} locale={locale} onRestore={handleRestore} />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
