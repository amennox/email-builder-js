import { useEffect, useState } from 'react';

import 'highlight.js/styles/github.css';

import { html, json } from './highlighters';

type TextEditorPanelProps = {
  type: 'json' | 'html';
  value: string;
};

export default function HighlightedCodePanel({ type, value }: TextEditorPanelProps) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    (type === 'html' ? html(value) : json(value)).then(setCode);
  }, [value, type]);

  if (code === null) {
    return null;
  }

  return (
    <pre
      className="m-0 cursor-text p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: code }}
      onClick={(ev) => {
        const selection = window.getSelection();
        if (selection?.toString().length === 0) {
          const range = window.document.createRange();
          range.selectNodeContents(ev.currentTarget);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }}
    />
  );
}
