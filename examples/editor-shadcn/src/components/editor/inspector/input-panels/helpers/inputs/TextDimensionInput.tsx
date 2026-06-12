import { useId, type ChangeEventHandler } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TextDimensionInputProps = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function TextDimensionInput({ label, defaultValue, onChange }: TextDimensionInputProps) {
  const id = useId();
  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = parseInt(ev.target.value);
    onChange(isNaN(value) ? null : value);
  };
  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          placeholder="auto"
          defaultValue={defaultValue ?? ''}
          onChange={handleChange}
          className="pr-8"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
          px
        </span>
      </div>
    </div>
  );
}
