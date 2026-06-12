import { cn } from '@/lib/utils';

type Props = {
  paletteColors: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function Swatch({ paletteColors, value, onChange }: Props) {
  return (
    <div className="grid w-full grid-cols-6 gap-1.5">
      {paletteColors.map((colorValue) => (
        <button
          key={colorValue}
          type="button"
          onClick={() => onChange(colorValue)}
          className={cn(
            'size-6 rounded-sm border outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
            value === colorValue ? 'border-foreground' : 'border-border hover:border-muted-foreground',
          )}
          style={{ backgroundColor: colorValue }}
        />
      ))}
    </div>
  );
}
