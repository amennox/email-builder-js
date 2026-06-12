import { useState } from 'react';

import { FileArchive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/documents/editor/EditorContext';
import { addExportRecord, useExportRecords, type TExportRecord } from '@/export/exportsStore';
import { exportTemplateAsZip } from '@/export/exportZip';
import { useT } from '@/lib/i18n';

export default function ExportsView() {
  const t = useT();
  const locale = useLocale();
  const records = useExportRecords();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleReExport = async (record: TExportRecord) => {
    setBusyId(record.id);
    try {
      const result = await exportTemplateAsZip(record.templateName, record.document);
      addExportRecord({
        templateName: record.templateName,
        imagesIncluded: result.imagesIncluded,
        imagesSkipped: result.skippedUrls.length,
        document: record.document,
      });
      toast.success(t('exports.done'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-xl font-semibold">{t('exports.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('exports.subtitle')}</p>

      {records.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <FileArchive className="size-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('exports.empty')}</p>
        </div>
      ) : (
        <div className="mt-6 divide-y rounded-lg border bg-card">
          {records.map((record) => (
            <div key={record.id} className="flex items-center gap-3 px-4 py-3">
              <FileArchive className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{record.templateName}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(record.exportedAt).toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  })}{' '}
                  · {record.imagesIncluded} {t('exports.imagesIncluded')}
                  {record.imagesSkipped > 0 && `, ${record.imagesSkipped} ${t('exports.imagesSkipped')}`}
                </div>
              </div>
              <Button variant="outline" size="sm" disabled={busyId !== null} onClick={() => void handleReExport(record)}>
                {busyId === record.id ? <Loader2 className="animate-spin" /> : <FileArchive />}
                {t('exports.reExport')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
