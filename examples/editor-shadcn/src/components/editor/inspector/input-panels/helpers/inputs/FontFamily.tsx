import { useId, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FONT_FAMILIES } from '../../../../../../documents/blocks/helpers/fontFamily';

type NullableProps = {
  label: string;
  onChange: (value: null | string) => void;
  defaultValue: null | string;
};
export function NullableFontFamily({ label, onChange, defaultValue }: NullableProps) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? 'inherit');

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inherit">Match email settings</SelectItem>
          {FONT_FAMILIES.map((option) => (
            <SelectItem key={option.key} value={option.key} style={{ fontFamily: option.value }}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
