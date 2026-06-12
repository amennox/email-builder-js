import { useMemo } from 'react';

import { Reader, renderToStaticMarkup } from '@usewaypoint/email-builder';

import EditorBlock from '@/documents/editor/EditorBlock';
import {
  setSelectedBlockId,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '@/documents/editor/EditorContext';
import { cn } from '@/lib/utils';

import EditorToolbar from './EditorToolbar';
import InspectorPanel from './InspectorPanel';
import HighlightedCodePanel from './helper/HighlightedCodePanel';

function HtmlPanel() {
  const document = useDocument();
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}

function JsonPanel() {
  const document = useDocument();
  const code = useMemo(() => JSON.stringify(document, null, 2), [document]);
  return <HighlightedCodePanel type="json" value={code} />;
}

function MainPanel() {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();

  const frameClass = cn(
    'mx-auto my-8 overflow-hidden rounded-lg border bg-white shadow-sm',
    selectedScreenSize === 'mobile' ? 'w-[370px]' : 'w-full max-w-[600px]',
  );

  switch (selectedMainTab) {
    case 'editor':
      return (
        <div className={frameClass}>
          <EditorBlock id="root" />
        </div>
      );
    case 'preview':
      return (
        <div className={frameClass}>
          <Reader document={document} rootBlockId="root" />
        </div>
      );
    case 'html':
      return (
        <div className="mx-6 my-8 overflow-hidden rounded-lg border bg-card">
          <HtmlPanel />
        </div>
      );
    case 'json':
      return (
        <div className="mx-6 my-8 overflow-hidden rounded-lg border bg-card">
          <JsonPanel />
        </div>
      );
  }
}

export default function EditorView() {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <EditorToolbar />
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto bg-muted/40" onClick={() => setSelectedBlockId(null)}>
          <MainPanel />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
}
