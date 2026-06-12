import { useState } from 'react';

import { Languages, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';

import { aiChat, AiUnavailableError } from './client';
import { buildRewriteMessages, type TRewriteAction } from './prompts/rewrite';
import { buildTranslateMessages, TRANSLATE_TARGETS, type TTranslateTarget } from './prompts/translate';

type Props = {
  getText: () => string;
  onApply: (text: string) => void;
};

/** Menu Sparkles per i pannelli Text/Heading/Button: riscrittura e traduzione. */
export default function AiTextActions({ getText, onApply }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const run = async (messages: Parameters<typeof aiChat>[0]) => {
    setBusy(true);
    try {
      const result = await aiChat(messages);
      onApply(result.trim());
      toast.success(t('ai.done'));
    } catch (err) {
      toast.error(err instanceof AiUnavailableError ? t('ai.unavailable') : t('ai.error'));
    } finally {
      setBusy(false);
    }
  };

  const rewrite = (action: TRewriteAction) => void run(buildRewriteMessages(getText(), action));
  const translate = (target: TTranslateTarget) => void run(buildTranslateMessages(getText(), target));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7" disabled={busy} title="AI">
          {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => rewrite('improve')}>{t('ai.improve')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => rewrite('formal')}>{t('ai.formal')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => rewrite('persuasive')}>{t('ai.persuasive')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => rewrite('shorten')}>{t('ai.shorten')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 size-4" />
            {t('ai.translate')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {TRANSLATE_TARGETS.map((target) => (
              <DropdownMenuItem key={target.code} onClick={() => translate(target.code)}>
                {target.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
