import React from 'react';

type BlockMenuButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export default function BlockTypeButton({ label, icon, onClick }: BlockMenuButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1.5 rounded-md p-2 text-xs text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      <span className="flex w-full items-center justify-center rounded-md border bg-muted p-2 [&_svg]:size-5 [&_svg]:text-muted-foreground">
        {icon}
      </span>
      {label}
    </button>
  );
}
