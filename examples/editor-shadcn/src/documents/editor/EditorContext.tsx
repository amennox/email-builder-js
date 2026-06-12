import { create } from 'zustand';

import { getInitialLocale, LOCALE_STORAGE_KEY, type TLocale } from '../../lib/i18n/core';
import getConfiguration from '../../getConfiguration';

import { TEditorConfiguration } from './core';

export type TView = 'dashboard' | 'editor' | 'prefab-templates' | 'my-templates' | 'exports';

type TValue = {
  document: TEditorConfiguration;

  currentView: TView;
  locale: TLocale;

  currentTemplateId: string | null;
  currentTemplateName: string | null;
  isDirty: boolean;

  selectedBlockId: string | null;
  selectedSidebarTab: 'block-configuration' | 'styles';
  selectedMainTab: 'editor' | 'preview' | 'json' | 'html';
  selectedScreenSize: 'desktop' | 'mobile';

  inspectorDrawerOpen: boolean;
};

const editorStateStore = create<TValue>(() => ({
  document: getConfiguration(window.location.hash),
  currentView: window.location.hash.startsWith('#code/') ? 'editor' : 'dashboard',
  locale: getInitialLocale(),
  currentTemplateId: null,
  currentTemplateName: null,
  isDirty: false,
  selectedBlockId: null,
  selectedSidebarTab: 'styles',
  selectedMainTab: 'editor',
  selectedScreenSize: 'desktop',
  inspectorDrawerOpen: true,
}));

export function useDocument() {
  return editorStateStore((s) => s.document);
}

export function useCurrentView() {
  return editorStateStore((s) => s.currentView);
}

export function useLocale() {
  return editorStateStore((s) => s.locale);
}

export function useCurrentTemplateId() {
  return editorStateStore((s) => s.currentTemplateId);
}

export function useCurrentTemplateName() {
  return editorStateStore((s) => s.currentTemplateName);
}

export function useIsDirty() {
  return editorStateStore((s) => s.isDirty);
}

export function useSelectedBlockId() {
  return editorStateStore((s) => s.selectedBlockId);
}

export function useSelectedScreenSize() {
  return editorStateStore((s) => s.selectedScreenSize);
}

export function useSelectedMainTab() {
  return editorStateStore((s) => s.selectedMainTab);
}

export function setSelectedMainTab(selectedMainTab: TValue['selectedMainTab']) {
  return editorStateStore.setState({ selectedMainTab });
}

export function useSelectedSidebarTab() {
  return editorStateStore((s) => s.selectedSidebarTab);
}

export function useInspectorDrawerOpen() {
  return editorStateStore((s) => s.inspectorDrawerOpen);
}

export function setCurrentView(currentView: TView) {
  return editorStateStore.setState({ currentView });
}

export function setLocale(locale: TLocale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  return editorStateStore.setState({ locale });
}

export function getEditorState() {
  return editorStateStore.getState();
}

export function setSelectedBlockId(selectedBlockId: TValue['selectedBlockId']) {
  const selectedSidebarTab = selectedBlockId === null ? 'styles' : 'block-configuration';
  const options: Partial<TValue> = {};
  if (selectedBlockId !== null) {
    options.inspectorDrawerOpen = true;
  }
  return editorStateStore.setState({
    selectedBlockId,
    selectedSidebarTab,
    ...options,
  });
}

export function setSidebarTab(selectedSidebarTab: TValue['selectedSidebarTab']) {
  return editorStateStore.setState({ selectedSidebarTab });
}

/**
 * Sostituisce l'intero documento (load template / import / reset).
 * Non marca lo stato come dirty: usato per caricamenti espliciti.
 */
export function resetDocument(document: TValue['document']) {
  return editorStateStore.setState({
    document,
    selectedSidebarTab: 'styles',
    selectedBlockId: null,
    isDirty: true,
  });
}

/**
 * Carica un template (prefatto o personale) nell'editor, pulendo lo stato dirty.
 */
export function loadTemplate(
  document: TValue['document'],
  meta: { templateId: string | null; templateName: string | null },
) {
  return editorStateStore.setState({
    document,
    selectedSidebarTab: 'styles',
    selectedBlockId: null,
    currentTemplateId: meta.templateId,
    currentTemplateName: meta.templateName,
    isDirty: false,
    currentView: 'editor',
    selectedMainTab: 'editor',
  });
}

export function markSaved(meta: { templateId: string; templateName: string }) {
  return editorStateStore.setState({
    currentTemplateId: meta.templateId,
    currentTemplateName: meta.templateName,
    isDirty: false,
  });
}

export function setDocument(document: TValue['document']) {
  const originalDocument = editorStateStore.getState().document;
  return editorStateStore.setState({
    document: {
      ...originalDocument,
      ...document,
    },
    isDirty: true,
  });
}

export function toggleInspectorDrawerOpen() {
  const inspectorDrawerOpen = !editorStateStore.getState().inspectorDrawerOpen;
  return editorStateStore.setState({ inspectorDrawerOpen });
}

export function setSelectedScreenSize(selectedScreenSize: TValue['selectedScreenSize']) {
  return editorStateStore.setState({ selectedScreenSize });
}
