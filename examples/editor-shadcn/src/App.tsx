import { useEffect } from 'react';

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
import EditorView from '@/components/editor/EditorView';
import AppHeader from '@/components/shell/AppHeader';
import AppSidebar from '@/components/shell/AppSidebar';
import {
  cancelPendingNavigation,
  confirmPendingNavigation,
  usePendingNavigationStore,
} from '@/components/shell/navigation';
import DashboardView from '@/components/views/DashboardView';
import ExportsView from '@/components/views/ExportsView';
import MyTemplatesView from '@/components/views/MyTemplatesView';
import PrefabTemplatesView from '@/components/views/PrefabTemplatesView';
import { useCurrentView } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import { checkAndResetCorruptedStorage } from '@/templates/templateStore';

function CurrentView() {
  const currentView = useCurrentView();
  switch (currentView) {
    case 'dashboard':
      return <DashboardView />;
    case 'editor':
      return <EditorView />;
    case 'prefab-templates':
      return <PrefabTemplatesView />;
    case 'my-templates':
      return <MyTemplatesView />;
    case 'exports':
      return <ExportsView />;
  }
}

function UnsavedChangesDialog() {
  const t = useT();
  const pending = usePendingNavigationStore((s) => s.pending);
  return (
    <AlertDialog open={pending !== null} onOpenChange={(open) => !open && cancelPendingNavigation()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('editor.unsavedChanges.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('editor.unsavedChanges.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('editor.unsavedChanges.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmPendingNavigation}>
            {t('editor.unsavedChanges.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function App() {
  const t = useT();

  useEffect(() => {
    if (checkAndResetCorruptedStorage()) {
      toast.error(t('templates.storageError'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <CurrentView />
        </main>
      </div>
      <UnsavedChangesDialog />
    </div>
  );
}
