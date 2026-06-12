import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
  buttonElement: HTMLElement | null;
  onClick: () => void;
};
export default function DividerButton({ buttonElement, onClick }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function listener({ clientX, clientY }: MouseEvent) {
      if (!buttonElement) {
        return;
      }
      const rect = buttonElement.getBoundingClientRect();
      const rectY = rect.y;
      const bottomX = rect.x;
      const topX = bottomX + rect.width;

      if (Math.abs(clientY - rectY) < 20) {
        if (bottomX < clientX && clientX < topX) {
          setVisible(true);
          return;
        }
      }
      setVisible(false);
    }
    window.addEventListener('mousemove', listener);
    return () => {
      window.removeEventListener('mousemove', listener);
    };
  }, [buttonElement, setVisible]);

  return (
    <button
      type="button"
      className={cn(
        'absolute -top-3 left-1/2 z-10 flex -translate-x-2.5 items-center justify-center rounded-full bg-primary p-0.5 text-primary-foreground shadow-sm outline-none transition-opacity hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      <Plus className="size-4" />
    </button>
  );
}
