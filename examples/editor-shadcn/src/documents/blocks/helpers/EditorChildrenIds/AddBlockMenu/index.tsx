import { useState } from 'react';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';

import { TEditorBlock } from '../../../../editor/core';

import BlockButton from './BlockButton';
import { BUTTONS } from './buttons';
import DividerButton from './DividerButton';
import PlaceholderButton from './PlaceholderButton';

type Props = {
  placeholder?: boolean;
  onSelect: (block: TEditorBlock) => void;
};
export default function AddBlockButton({ onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [buttonElement, setButtonElement] = useState<HTMLElement | null>(null);

  const handleSelect = (block: TEditorBlock) => {
    onSelect(block);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={setButtonElement} className="relative">
          {placeholder ? (
            <PlaceholderButton onClick={() => setOpen(true)} />
          ) : (
            <DividerButton buttonElement={buttonElement} onClick={() => setOpen(true)} />
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-2" align="center" onClick={(ev) => ev.stopPropagation()}>
        <div className="grid grid-cols-4 gap-1">
          {BUTTONS.map((k, i) => (
            <BlockButton key={i} label={k.label} icon={k.icon} onClick={() => handleSelect(k.block())} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
