import { useId, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Props = {
  label: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
};

export default function BooleanInput({ label, defaultValue, onChange }: Props) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={value}
        onCheckedChange={(checked) => {
          setValue(checked);
          onChange(checked);
        }}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
