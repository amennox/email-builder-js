import { FileArchive, FolderOpen, LayoutDashboard, LayoutTemplate, Pencil } from 'lucide-react';

import { useCurrentView } from '@/documents/editor/EditorContext';
import type { TView } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import poweredBy from '@/assets/powered-by.svg';

import { requestView } from './navigation';

type TNavItem = {
  view: TView;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
};

const MAIN_ITEMS: TNavItem[] = [{ view: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard }];

const BUILDER_ITEMS: TNavItem[] = [
  { view: 'editor', labelKey: 'nav.editor', icon: Pencil },
  { view: 'prefab-templates', labelKey: 'nav.prefabTemplates', icon: LayoutTemplate },
  { view: 'my-templates', labelKey: 'nav.myTemplates', icon: FolderOpen },
  { view: 'exports', labelKey: 'nav.exports', icon: FileArchive },
];

function NavButton({ item }: { item: TNavItem }) {
  const t = useT();
  const currentView = useCurrentView();
  const active = currentView === item.view;
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => requestView(item.view)}
      className={cn(
        'relative flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        active ? 'bg-accent font-medium text-accent-foreground' : 'text-foreground/80',
      )}
    >
      {active && <span className="absolute -left-2 h-5 w-0.5 rounded-r bg-foreground" />}
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {t(item.labelKey)}
    </button>
  );
}

export default function AppSidebar() {
  const t = useT();
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/30">
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {MAIN_ITEMS.map((item) => (
            <NavButton key={item.view} item={item} />
          ))}
        </div>
        <div className="px-2 pt-5 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {t('nav.section.emailBuilder')}
        </div>
        <div className="space-y-0.5">
          {BUILDER_ITEMS.map((item) => (
            <NavButton key={item.view} item={item} />
          ))}
        </div>
      </nav>
      <div className="mt-auto flex flex-col items-center gap-1.5 border-t p-4">
        <span className="text-xs text-muted-foreground">{t('nav.poweredBy')}</span>
        <img src={poweredBy} alt="Powered by" className="h-5 opacity-80" />
      </div>
    </aside>
  );
}
