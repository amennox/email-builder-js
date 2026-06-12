import { create } from 'zustand';

import {
  getEditorState,
  loadTemplate,
  setCurrentView,
  type TView,
} from '@/documents/editor/EditorContext';
import { getPrefab } from '@/templates/prefabs';
import { getTemplate } from '@/templates/templateStore';

type TPendingAction = { type: 'view'; view: TView } | { type: 'open-template'; kind: 'prefab' | 'saved'; id: string };

/** Azione in attesa di conferma quando ci sono modifiche non salvate. */
export const usePendingNavigationStore = create<{ pending: TPendingAction | null }>(() => ({ pending: null }));

function perform(action: TPendingAction) {
  if (action.type === 'view') {
    setCurrentView(action.view);
    return;
  }
  if (action.kind === 'prefab') {
    const prefab = getPrefab(action.id);
    if (prefab) {
      // I prefatti sono read-only: si aprono senza templateId, il salvataggio creerà una copia.
      loadTemplate(prefab.document, { templateId: null, templateName: prefab.name });
    }
  } else {
    const saved = getTemplate(action.id);
    if (saved) {
      loadTemplate(saved.document, { templateId: saved.id, templateName: saved.name });
    }
  }
}

function requestAction(action: TPendingAction) {
  const { isDirty, currentView } = getEditorState();
  const leavesEditor = action.type === 'view' ? action.view !== 'editor' : true;
  if (isDirty && currentView === 'editor' && leavesEditor) {
    usePendingNavigationStore.setState({ pending: action });
    return;
  }
  perform(action);
}

export function requestView(view: TView) {
  requestAction({ type: 'view', view });
}

export function openTemplate(kind: 'prefab' | 'saved', id: string) {
  requestAction({ type: 'open-template', kind, id });
}

export function confirmPendingNavigation() {
  const { pending } = usePendingNavigationStore.getState();
  usePendingNavigationStore.setState({ pending: null });
  if (pending) {
    perform(pending);
  }
}

export function cancelPendingNavigation() {
  usePendingNavigationStore.setState({ pending: null });
}
