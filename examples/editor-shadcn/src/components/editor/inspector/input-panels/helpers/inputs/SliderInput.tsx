import { useState, type ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type SliderInputProps = {
  label: string;
  iconLabel: ReactNode;
  step?: number;
  marks?: boolean;
  units: string;
  min?: number;
  max?: number;
  defaultValue: number;
  onChange: (v: number) => void;
};

export default function SliderInput({
  label,
  iconLabel,
  units,
  step,
  min,
  max,
  defaultValue,
  onChange,
}: SliderInputProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {units}
        </span>
      </div>
      <div className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
        {iconLabel}
        <Slider
          value={[value]}
          step={step}
          min={min}
          max={max}
          onValueChange={([v]) => {
            setValue(v);
            onChange(v);
          }}
        />
      </div>
    </div>
  );
}
