import { Plus } from 'lucide-react';

type Props = {
  onClick: () => void;
};
export default function PlaceholderButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-center rounded-md border border-dashed border-border text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      <span className="flex items-center justify-center rounded-full bg-primary p-0.5 text-primary-foreground">
        <Plus className="size-4" />
      </span>
    </button>
  );
}
