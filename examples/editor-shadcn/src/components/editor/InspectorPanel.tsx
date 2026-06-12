import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  setDocument,
  setSidebarTab,
  useDocument,
  useInspectorDrawerOpen,
  useSelectedSidebarTab,
} from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import ConfigurationPanel from './inspector';
import EmailLayoutSidebarPanel from './inspector/input-panels/EmailLayoutSidebarPanel';

function StylesPanel() {
  const block = useDocument().root;
  if (!block) {
    return null;
  }
  const { data, type } = block;
  if (type !== 'EmailLayout') {
    throw new Error('Expected "root" element to be of type EmailLayout');
  }
  return <EmailLayoutSidebarPanel key="root" data={data} setData={(data) => setDocument({ root: { type, data } })} />;
}

export default function InspectorPanel() {
  const t = useT();
  const open = useInspectorDrawerOpen();
  const selectedSidebarTab = useSelectedSidebarTab();

  return (
    <aside
      className={cn(
        'shrink-0 overflow-hidden border-l bg-background transition-[width] duration-200',
        open ? 'w-80' : 'w-0 border-l-0',
      )}
    >
      <div className="flex h-12 w-80 items-center border-b px-4">
        <Tabs value={selectedSidebarTab} onValueChange={(v) => setSidebarTab(v as 'styles' | 'block-configuration')}>
          <TabsList>
            <TabsTrigger value="styles">{t('inspector.styles')}</TabsTrigger>
            <TabsTrigger value="block-configuration">{t('inspector.block')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-[calc(100%-3rem)] w-80 overflow-y-auto">
        {selectedSidebarTab === 'styles' ? <StylesPanel /> : <ConfigurationPanel />}
      </div>
    </aside>
  );
}
