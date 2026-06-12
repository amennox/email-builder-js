import { Copy, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { PREFAB_TEMPLATES } from '@/templates/prefabs';
import { saveTemplate } from '@/templates/templateStore';
import { loadTemplate } from '@/documents/editor/EditorContext';

import { openTemplate } from '../shell/navigation';

import TemplateCard from './TemplateCard';

export default function PrefabTemplatesView() {
  const t = useT();

  const handleUseAsBase = (prefabId: string) => {
    const prefab = PREFAB_TEMPLATES.find((p) => p.id === prefabId);
    if (!prefab) {
      return;
    }
    const saved = saveTemplate(`${prefab.name} ${t('templates.copySuffix')}`, prefab.document);
    loadTemplate(saved.document, { templateId: saved.id, templateName: saved.name });
    toast.success(t('templates.duplicated'));
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-start justify-between p-6 pb-2">
        <div>
          <h1 className="text-xl font-semibold">{t('templates.prefab.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('templates.prefab.subtitle')}</p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-6 pt-4">
        {PREFAB_TEMPLATES.map((prefab) => (
          <TemplateCard
            key={prefab.id}
            name={prefab.name}
            document={prefab.document}
            onOpen={() => openTemplate('prefab', prefab.id)}
            menu={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openTemplate('prefab', prefab.id)}>
                    <FolderOpen />
                    {t('templates.open')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUseAsBase(prefab.id)}>
                    <Copy />
                    {t('templates.useAsBase')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        ))}
      </div>
    </div>
  );
}
