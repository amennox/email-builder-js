import type { ComponentProps } from 'react';

import { ToggleGroupItem } from '@/components/ui/toggle-group';

/** Shim API-compatibile con il vecchio ToggleButton MUI usato nei pannelli. */
export default function ToggleButton(props: ComponentProps<typeof ToggleGroupItem>) {
  return <ToggleGroupItem {...props} />;
}
