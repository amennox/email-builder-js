import { AlignCenterHorizontal, AlignEndHorizontal, AlignStartHorizontal, StretchHorizontal } from 'lucide-react';

import { useState } from 'react';
import { ZodError } from 'zod';

import ToggleButton from './helpers/inputs/ToggleButton';

import ColumnsContainerPropsSchema, {
  ColumnsContainerProps,
} from '../../../../documents/blocks/ColumnsContainer/ColumnsContainerPropsSchema';

import { useT } from '../../../../lib/i18n';
import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColumnWidthsInput from './helpers/inputs/ColumnWidthsInput';
import BooleanInput from './helpers/inputs/BooleanInput';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import SliderInput from './helpers/inputs/SliderInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type ColumnsContainerPanelProps = {
  data: ColumnsContainerProps;
  setData: (v: ColumnsContainerProps) => void;
};
export default function ColumnsContainerPanel({ data, setData }: ColumnsContainerPanelProps) {
  const t = useT();
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = ColumnsContainerPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title={t('inspector.columns.title')}>
      <RadioGroupInput
        label={t('inspector.columns.count')}
        defaultValue={data.props?.columnsCount === 2 ? '2' : '3'}
        onChange={(v) => {
          updateData({ ...data, props: { ...data.props, columnsCount: v === '2' ? 2 : 3 } });
        }}
      >
        <ToggleButton value="2">2</ToggleButton>
        <ToggleButton value="3">3</ToggleButton>
      </RadioGroupInput>
      <ColumnWidthsInput
        defaultValue={data.props?.fixedWidths}
        onChange={(fixedWidths) => {
          updateData({ ...data, props: { ...data.props, fixedWidths } });
        }}
      />
      <SliderInput
        label={t('inspector.columns.gap')}
        iconLabel={<StretchHorizontal />}
        units="px"
        step={4}
        marks
        min={0}
        max={80}
        defaultValue={data.props?.columnsGap ?? 0}
        onChange={(columnsGap) => updateData({ ...data, props: { ...data.props, columnsGap } })}
      />
      <RadioGroupInput
        label={t('inspector.columns.alignment')}
        defaultValue={data.props?.contentAlignment ?? 'middle'}
        onChange={(contentAlignment) => {
          updateData({ ...data, props: { ...data.props, contentAlignment } });
        }}
      >
        <ToggleButton value="top">
          <AlignStartHorizontal />
        </ToggleButton>
        <ToggleButton value="middle">
          <AlignCenterHorizontal />
        </ToggleButton>
        <ToggleButton value="bottom">
          <AlignEndHorizontal />
        </ToggleButton>
      </RadioGroupInput>

      <BooleanInput
        label={t('inspector.columns.stackMobile')}
        defaultValue={data.props?.stackOnMobile ?? false}
        onChange={(stackOnMobile) => updateData({ ...data, props: { ...data.props, stackOnMobile } })}
      />
      <BooleanInput
        label={t('inspector.columns.reverseMobile')}
        defaultValue={data.props?.reverseColumnsOnMobile ?? false}
        onChange={(reverseColumnsOnMobile) =>
          updateData({ ...data, props: { ...data.props, reverseColumnsOnMobile } })
        }
      />
      <MultiStylePropertyPanel
        names={['backgroundColor', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
