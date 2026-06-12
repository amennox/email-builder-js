import { useState } from 'react';

import {
  Braces,
  CodeXml,
  Download,
  Eye,
  FileArchive,
  Loader2,
  Monitor,
  Moon,
  PanelRight,
  Pencil,
  Save,
  Share2,
  Smartphone,
  Sun,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  markSaved,
  setSelectedMainTab,
  setSelectedScreenSize,
  toggleInspectorDrawerOpen,
  useCurrentTemplateId,
  useCurrentTemplateName,
  useDocument,
  useIsDirty,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '@/documents/editor/EditorContext';
import { addExportRecord } from '@/export/exportsStore';
import { exportTemplateAsZip } from '@/export/exportZip';
import { useT } from '@/lib/i18n';
import { toggleUiTheme } from '@/lib/theme';
import { getTemplate, saveTemplate } from '@/templates/templateStore';

import ImportJsonDialog from './ImportJsonDialog';

function downloadJson(document: object, name: string) {
  const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = `${name || 'emailTemplate'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EditorToolbar() {
  const t = useT();
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const templateId = useCurrentTemplateId();
  const templateName = useCurrentTemplateName();
  const isDirty = useIsDirty();

  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [, forceRender] = useState(0);

  const displayName = templateName ?? t('editor.untitled');

  const persist = (name: string, id?: string) => {
    const saved = saveTemplate(name, document, id);
    markSaved({ templateId: saved.id, templateName: saved.name });
    toast.success(t('templates.saved'));
  };

  const handleSave = () => {
    // Salva su template personale esistente; altrimenti "Salva come"
    if (templateId && getTemplate(templateId)) {
      persist(displayName, templateId);
      return;
    }
    setSaveAsName(templateName ? `${templateName} ${t('templates.copySuffix')}` : '');
    setSaveAsOpen(true);
  };

  const handleSaveAsSubmit = () => {
    if (saveAsName.trim()) {
      persist(saveAsName.trim());
      setSaveAsOpen(false);
    }
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const result = await exportTemplateAsZip(displayName, document);
      addExportRecord({
        templateName: displayName,
        imagesIncluded: result.imagesIncluded,
        imagesSkipped: result.skippedUrls.length,
        document,
      });
      if (result.skippedUrls.length > 0) {
        toast.warning(`${t('exports.warningSkipped')} ${result.skippedUrls.join(', ')}`);
      } else {
        toast.success(t('exports.done'));
      }
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    const c = encodeURIComponent(JSON.stringify(document));
    const url = `${location.origin}${location.pathname}#code/${btoa(c)}`;
    history.replaceState(null, '', `#code/${btoa(c)}`);
    void navigator.clipboard.writeText(url).then(() => toast.success(t('editor.shareCopied')));
  };

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background px-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium">{displayName}</span>
        {isDirty && <Badge variant="secondary">{t('editor.unsaved')}</Badge>}
      </div>

      <Tabs value={selectedMainTab} onValueChange={(v) => setSelectedMainTab(v as typeof selectedMainTab)}>
        <TabsList>
          <TabsTrigger value="editor">
            <Pencil />
            <span className="hidden lg:inline">{t('editor.tab.edit')}</span>
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
            <span className="hidden lg:inline">{t('editor.tab.preview')}</span>
          </TabsTrigger>
          <TabsTrigger value="html">
            <CodeXml />
            <span className="hidden lg:inline">{t('editor.tab.html')}</span>
          </TabsTrigger>
          <TabsTrigger value="json">
            <Braces />
            <span className="hidden lg:inline">{t('editor.tab.json')}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-1">
        <ToggleGroup
          type="single"
          value={selectedScreenSize}
          onValueChange={(v) => setSelectedScreenSize(v === 'mobile' ? 'mobile' : 'desktop')}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="desktop" aria-label={t('editor.desktop')}>
            <Monitor />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label={t('editor.mobile')}>
            <Smartphone />
          </ToggleGroupItem>
        </ToggleGroup>

        <Button size="sm" className="ml-1" onClick={handleSave}>
          <Save />
          {t('editor.save')}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exporting}>
              {exporting ? <Loader2 className="animate-spin" /> : <FileArchive />}
              {t('editor.export')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void handleExportZip()}>
              <FileArchive />
              {t('templates.exportZip')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadJson(document, displayName)}>
              <Download />
              {t('editor.downloadJson')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setImportOpen(true)}>
              <Upload />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.importJson')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.share')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toggleUiTheme();
                forceRender((n) => n + 1);
              }}
            >
              {window.document.documentElement.classList.contains('dark') ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.toggleTheme')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleInspectorDrawerOpen}>
              <PanelRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.toggleInspector')}</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={saveAsOpen} onOpenChange={setSaveAsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.saveAs.title')}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              handleSaveAsSubmit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="save-as-name">{t('editor.saveAs.label')}</Label>
              <Input
                id="save-as-name"
                value={saveAsName}
                onChange={(ev) => setSaveAsName(ev.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveAsOpen(false)}>
                {t('editor.saveAs.cancel')}
              </Button>
              <Button type="submit" disabled={!saveAsName.trim()}>
                {t('editor.saveAs.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {importOpen && <ImportJsonDialog onClose={() => setImportOpen(false)} />}
    </div>
  );
}
