import { useState, type ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { ToggleGroup } from '@/components/ui/toggle-group';

type Props = {
  label: string | ReactNode;
  children: ReactNode;
  defaultValue: string;
  onChange: (v: string) => void;
};
export default function RadioGroupInput({ label, children, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        className="w-full"
        value={value}
        onValueChange={(v) => {
          if (v) {
            setValue(v);
            onChange(v);
          }
        }}
      >
        {children}
      </ToggleGroup>
    </div>
  );
}
