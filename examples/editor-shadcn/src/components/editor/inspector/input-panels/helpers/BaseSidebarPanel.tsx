import type { ReactNode } from 'react';

type SidebarPanelProps = {
  title: string;
  children: ReactNode;
};
export default function BaseSidebarPanel({ title, children }: SidebarPanelProps) {
  return (
    <div className="p-4">
      <p className="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
