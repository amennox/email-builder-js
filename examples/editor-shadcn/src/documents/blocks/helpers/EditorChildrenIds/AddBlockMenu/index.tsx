import { useState } from 'react';

import { Sparkles } from 'lucide-react';

import AiGenerateDialog from '@/ai/AiGenerateDialog';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { useT } from '@/lib/i18n';

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
  const t = useT();
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
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
        <button
          type="button"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-dashed p-2 text-xs text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={() => {
            setOpen(false);
            setAiOpen(true);
          }}
        >
          <Sparkles className="size-4" />
          {t('ai.generateSection')}
        </button>
      </PopoverContent>
      {aiOpen && <AiGenerateDialog onClose={() => setAiOpen(false)} onInsertRoot={onSelect} />}
    </Popover>
  );
}
