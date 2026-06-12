import type { ReactNode } from 'react';

import { Slider } from '@/components/ui/slider';

type Props = {
  iconLabel: ReactNode;
  step?: number;
  marks?: boolean;
  units: string;
  min?: number;
  max?: number;
  value: number;
  setValue: (v: number) => void;
};

export default function RawSliderInput({ iconLabel, value, setValue, units, step, min, max }: Props) {
  return (
    <div className="flex w-full items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
      {iconLabel}
      <Slider value={[value]} step={step} min={min} max={max} onValueChange={([v]) => setValue(v)} />
      <span className="w-12 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {value}
        {units}
      </span>
    </div>
  );
}
