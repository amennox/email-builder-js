import { useState } from 'react';

import { Copy, EllipsisVertical, FileArchive, FolderOpen, History, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadTemplate, useLocale } from '@/documents/editor/EditorContext';
import { addExportRecord } from '@/export/exportsStore';
import { exportTemplateAsZip } from '@/export/exportZip';
import { useT } from '@/lib/i18n';
import EMPTY_EMAIL_MESSAGE from '@/getConfiguration/sample/empty-email-message';
import {
  deleteTemplate,
  duplicateTemplate,
  renameTemplate,
  useMyTemplates,
  type TSavedTemplate,
} from '@/templates/templateStore';

import { openTemplate } from '../shell/navigation';

import TemplateCard from './TemplateCard';
import { VersionHistoryPanel } from './VersionHistoryPanel';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function MyTemplatesView() {
  const t = useT();
  const locale = useLocale();
  const templates = useMyTemplates();

  const [renaming, setRenaming] = useState<TSavedTemplate | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<TSavedTemplate | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [historyTemplate, setHistoryTemplate] = useState<TSavedTemplate | null>(null);

  const handleNew = () => {
    loadTemplate(EMPTY_EMAIL_MESSAGE, { templateId: null, templateName: null });
  };

  const handleRenameSubmit = () => {
    if (renaming && renameValue.trim()) {
      renameTemplate(renaming.id, renameValue.trim());
      toast.success(t('templates.renamed'));
    }
    setRenaming(null);
  };

  const handleDuplicate = (tpl: TSavedTemplate) => {
    duplicateTemplate(tpl.id, t('templates.copySuffix'));
    toast.success(t('templates.duplicated'));
  };

  const handleDelete = () => {
    if (deleting) {
      deleteTemplate(deleting.id);
      toast.success(t('templates.deleted'));
    }
    setDeleting(null);
  };

  const handleExport = async (tpl: TSavedTemplate) => {
    setExportingId(tpl.id);
    try {
      const result = await exportTemplateAsZip(tpl.name, tpl.document);
      addExportRecord({
        templateName: tpl.name,
        imagesIncluded: result.imagesIncluded,
        imagesSkipped: result.skippedUrls.length,
        document: tpl.document,
      });
      if (result.skippedUrls.length > 0) {
        toast.warning(`${t('exports.warningSkipped')} ${result.skippedUrls.join(', ')}`);
      } else {
        toast.success(t('exports.done'));
      }
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-start justify-between p-6 pb-2">
        <div>
          <h1 className="text-xl font-semibold">{t('templates.my.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('templates.my.subtitle')}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus />
          {t('templates.new')}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
          <FolderOpen className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium">{t('templates.empty.title')}</p>
            <p className="text-sm text-muted-foreground">{t('templates.empty.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={handleNew}>
            <Plus />
            {t('templates.new')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-6 pt-4">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              name={tpl.name}
              document={tpl.document}
              subtitle={`${t('templates.updatedAt')} ${formatDate(tpl.updatedAt, locale)}`}
              onOpen={() => openTemplate('saved', tpl.id)}
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      {exportingId === tpl.id ? <Loader2 className="animate-spin" /> : <EllipsisVertical />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setRenaming(tpl);
                        setRenameValue(tpl.name);
                      }}
                    >
                      <Pencil />
                      {t('templates.rename')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(tpl)}>
                      <Copy />
                      {t('templates.duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void handleExport(tpl)}>
                      <FileArchive />
                      {t('templates.exportZip')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setHistoryTemplate(tpl)}>
                      <History />
                      {t('versions.menu')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleting(tpl)}>
                      <Trash2 />
                      {t('templates.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))}
        </div>
      )}

      <Dialog open={renaming !== null} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templates.rename.title')}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              handleRenameSubmit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="rename-input">{t('templates.rename.label')}</Label>
              <Input id="rename-input" value={renameValue} onChange={(ev) => setRenameValue(ev.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!renameValue.trim()}>
                {t('templates.rename.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} — {t('templates.deleteConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('templates.deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>
              {t('templates.deleteConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {historyTemplate && (
        <VersionHistoryPanel
          template={historyTemplate}
          open={historyTemplate !== null}
          onClose={() => setHistoryTemplate(null)}
        />
      )}
    </div>
  );
}
