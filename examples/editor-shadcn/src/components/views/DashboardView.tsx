import { FileArchive, FolderOpen, LayoutTemplate } from 'lucide-react';

import { useLocale } from '@/documents/editor/EditorContext';
import { useExportRecords } from '@/export/exportsStore';
import { useT } from '@/lib/i18n';
import { PREFAB_TEMPLATES } from '@/templates/prefabs';
import { useMyTemplates } from '@/templates/templateStore';

function StatCard({ icon: Icon, label, value }: { icon: typeof FolderOpen; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function DashboardView() {
  const t = useT();
  const locale = useLocale();
  const templates = useMyTemplates();
  const exports = useExportRecords();

  const lastSaved =
    templates.length > 0
      ? new Date(Math.max(...templates.map((tpl) => Date.parse(tpl.updatedAt)))).toLocaleString(
          locale === 'it' ? 'it-IT' : 'en-GB',
          { dateStyle: 'short', timeStyle: 'short' },
        )
      : t('dashboard.never');

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <StatCard icon={FolderOpen} label={t('dashboard.myTemplatesCount')} value={String(templates.length)} />
        <StatCard icon={LayoutTemplate} label={t('dashboard.prefabCount')} value={String(PREFAB_TEMPLATES.length)} />
        <StatCard icon={FolderOpen} label={t('dashboard.lastSaved')} value={lastSaved} />
        <StatCard icon={FileArchive} label={t('dashboard.exportsCount')} value={String(exports.length)} />
      </div>
    </div>
  );
}
