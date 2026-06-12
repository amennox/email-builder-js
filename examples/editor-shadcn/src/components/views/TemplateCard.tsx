import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { Reader } from '@/email';

import { TEditorConfiguration } from '@/documents/editor/core';

const EMAIL_WIDTH = 600;

/** Miniatura: email renderizzata con Reader e scalata nel contenitore. */
export function TemplateThumbnail({ document }: { document: TEditorConfiguration }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setScale(el.clientWidth / EMAIL_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none aspect-[4/3] overflow-hidden border-b bg-white">
      <div style={{ width: EMAIL_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Reader document={document} rootBlockId="root" />
      </div>
    </div>
  );
}

type TemplateCardProps = {
  name: string;
  document: TEditorConfiguration;
  subtitle?: string;
  onOpen: () => void;
  menu?: ReactNode;
};

export default function TemplateCard({ name, document, subtitle, onOpen, menu }: TemplateCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-sm">
      <button type="button" className="block w-full text-left outline-none" onClick={onOpen}>
        <TemplateThumbnail document={document} />
        <div className="space-y-0.5 p-3 pr-10">
          <div className="truncate text-sm font-medium">{name}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </button>
      {menu && <div className="absolute right-2 bottom-2.5">{menu}</div>}
    </div>
  );
}
