import { useState } from 'react';

import { Plus, X } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import Picker from './Picker';

type Props =
  | {
      nullable: true;
      label: string;
      onChange: (value: string | null) => void;
      defaultValue: string | null;
    }
  | {
      nullable: false;
      label: string;
      onChange: (value: string) => void;
      defaultValue: string;
    };

export default function ColorInput({ label, defaultValue, onChange, nullable }: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="size-8 rounded-md border shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              style={value ? { backgroundColor: value } : undefined}
            >
              {!value && <Plus className="m-auto size-4 text-muted-foreground" />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Picker
              value={value || ''}
              fieldLabel={label}
              onChange={(v) => {
                setValue(v);
                onChange(v);
              }}
            />
          </PopoverContent>
        </Popover>
        {nullable && value && (
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => {
              setValue(null);
              (onChange as (v: string | null) => void)(null);
            }}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
