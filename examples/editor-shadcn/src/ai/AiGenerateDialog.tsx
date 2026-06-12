import { useState } from 'react';

import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { setDocument } from '@/documents/editor/EditorContext';
import { TEditorBlock } from '@/documents/editor/core';
import { useT } from '@/lib/i18n';

import { AiUnavailableError } from './client';
import { generateSection } from './generateSection';

type Props = {
  onClose: () => void;
  /** Inserisce il blocco radice nel contenitore di destinazione (contratto AddBlockMenu). */
  onInsertRoot: (block: TEditorBlock) => void;
};

export default function AiGenerateDialog({ onClose, onInsertRoot }: Props) {
  const t = useT();
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const { blocks, order } = await generateSection(prompt.trim());

      let rootBlock: TEditorBlock;
      if (order.length === 1) {
        rootBlock = blocks[order[0]];
        const { [order[0]]: _omitted, ...children } = blocks;
        setDocument(children);
      } else {
        // più radici: le avvolgiamo in un Container trasparente
        setDocument(blocks);
        rootBlock = {
          type: 'Container',
          data: { style: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }, props: { childrenIds: order } },
        } as TEditorBlock;
      }
      onInsertRoot(rootBlock);
      toast.success(t('ai.done'));
      onClose();
    } catch (err) {
      if (err instanceof AiUnavailableError) {
        toast.error(t('ai.unavailable'));
      } else {
        toast.error(t('ai.generateSection.invalid'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            {t('ai.generateSection.title')}
          </DialogTitle>
          <DialogDescription>{t('ai.generateSection.description')}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(ev) => {
            ev.preventDefault();
            void handleSubmit();
          }}
        >
          <Textarea
            rows={4}
            value={prompt}
            onChange={(ev) => setPrompt(ev.target.value)}
            placeholder={t('ai.generateSection.placeholder')}
            autoFocus
            disabled={busy}
          />
          <DialogFooter>
            <Button type="submit" disabled={busy || prompt.trim().length < 8}>
              {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {busy ? t('ai.generating') : t('ai.generateSection.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
