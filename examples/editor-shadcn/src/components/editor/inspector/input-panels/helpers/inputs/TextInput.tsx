import { useId, useState, type ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  label: string;
  rows?: number;
  placeholder?: string;
  helperText?: string | ReactNode;
  icon?: ReactNode;
  defaultValue: string;
  onChange: (v: string) => void;
};
export default function TextInput({ helperText, label, placeholder, rows, icon, defaultValue, onChange }: Props) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const isMultiline = typeof rows === 'number' && rows > 1;

  const handleChange = (v: string) => {
    setValue(v);
    onChange(v);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {isMultiline ? (
        <Textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(ev) => handleChange(ev.target.value)}
        />
      ) : (
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
              {icon}
            </span>
          )}
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(ev) => handleChange(ev.target.value)}
            className={icon ? 'pl-8' : undefined}
          />
        </div>
      )}
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
