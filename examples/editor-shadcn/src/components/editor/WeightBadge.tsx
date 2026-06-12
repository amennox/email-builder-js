import { useDeferredValue, useMemo } from 'react';

import { renderToStaticMarkup } from '@/email';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDocument } from '@/documents/editor/EditorContext';
import { classifyWeight, formatKb, htmlWeightBytes } from '@/lib/htmlWeight';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function WeightBadge() {
  const t = useT();
  const document = useDocument();
  // deferred: il calcolo non deve rallentare la digitazione
  const deferredDocument = useDeferredValue(document);

  const { bytes, level } = useMemo(() => {
    const html = renderToStaticMarkup(deferredDocument, { rootBlockId: 'root' });
    const bytes = htmlWeightBytes(html);
    return { bytes, level: classifyWeight(bytes) };
  }, [deferredDocument]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={level === 'ok' ? 'secondary' : 'default'}
          className={cn(
            'tabular-nums',
            level === 'warning' && 'bg-amber-500 text-white',
            level === 'over' && 'bg-destructive text-white',
          )}
        >
          {formatKb(bytes)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{level === 'ok' ? t('weight.ok') : t('weight.warning')}</TooltipContent>
    </Tooltip>
  );
}
