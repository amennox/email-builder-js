import { useState } from 'react';
import { ZodError } from 'zod';

import { TextProps, TextPropsSchema } from '@usewaypoint/block-text';

import AiTextActions from '../../../../ai/AiTextActions';
import { useT } from '../../../../lib/i18n';
import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import BooleanInput from './helpers/inputs/BooleanInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({ data, setData }: TextSidebarPanelProps) {
  const t = useT();
  const [, setErrors] = useState<ZodError | null>(null);
  const [aiRev, setAiRev] = useState(0);

  const updateData = (d: unknown) => {
    const res = TextPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title={t('inspector.text.title')}>
      <div className="relative">
        <div className="absolute -top-1 right-0 z-10">
          <AiTextActions
            getText={() => data.props?.text ?? ''}
            onApply={(text) => {
              updateData({ ...data, props: { ...data.props, text } });
              setAiRev((n) => n + 1);
            }}
          />
        </div>
        <TextInput
          key={aiRev}
          label={t('inspector.text.content')}
          rows={5}
          defaultValue={data.props?.text ?? ''}
          onChange={(text) => updateData({ ...data, props: { ...data.props, text } })}
        />
      </div>
      <BooleanInput
        label={t('inspector.text.markdown')}
        defaultValue={data.props?.markdown ?? false}
        onChange={(markdown) => updateData({ ...data, props: { ...data.props, markdown } })}
      />

      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
