import { useState } from 'react';

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import RadioGroupInput from './RadioGroupInput';
import ToggleButton from './ToggleButton';

type Props = {
  label: string;
  defaultValue: string | null;
  onChange: (value: string | null) => void;
};
export default function TextAlignInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue ?? 'left');

  return (
    <RadioGroupInput
      label={label}
      defaultValue={value}
      onChange={(textAlign) => {
        setValue(textAlign);
        onChange(textAlign);
      }}
    >
      <ToggleButton value="left">
        <AlignLeft />
      </ToggleButton>
      <ToggleButton value="center">
        <AlignCenter />
      </ToggleButton>
      <ToggleButton value="right">
        <AlignRight />
      </ToggleButton>
    </RadioGroupInput>
  );
}
