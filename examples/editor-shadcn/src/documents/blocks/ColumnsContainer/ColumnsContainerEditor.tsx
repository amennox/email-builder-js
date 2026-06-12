import { ColumnsContainer as BaseColumnsContainer } from '@usewaypoint/block-columns-container';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument, setSelectedBlockId, useSelectedScreenSize } from '../../editor/EditorContext';
import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

const EMPTY_COLUMNS = [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }];

export default function ColumnsContainerEditor({ style, props }: ColumnsContainerProps) {
  const currentBlockId = useCurrentBlockId();
  const screenSize = useSelectedScreenSize();

  const { columns, ...restProps } = props ?? {};
  const columnsValue = columns ?? EMPTY_COLUMNS;

  const updateColumn = (columnIndex: 0 | 1 | 2, { block, blockId, childrenIds }: EditorChildrenChange) => {
    const nColumns = [...columnsValue];
    nColumns[columnIndex] = { childrenIds };
    setDocument({
      [blockId]: block,
      [currentBlockId]: {
        type: 'ColumnsContainer',
        data: ColumnsContainerPropsSchema.parse({
          style,
          props: {
            ...restProps,
            columns: nColumns,
          },
        }),
      },
    });
    setSelectedBlockId(blockId);
  };

  const editorColumns = [
    <EditorChildrenIds childrenIds={columns?.[0]?.childrenIds} onChange={(change) => updateColumn(0, change)} />,
    <EditorChildrenIds childrenIds={columns?.[1]?.childrenIds} onChange={(change) => updateColumn(1, change)} />,
    <EditorChildrenIds childrenIds={columns?.[2]?.childrenIds} onChange={(change) => updateColumn(2, change)} />,
  ];

  // Vista mobile + stack attivo: simula l'incolonnamento (con eventuale inversione)
  if (screenSize === 'mobile' && props?.stackOnMobile) {
    const count = props?.columnsCount ?? 2;
    const visible = editorColumns.slice(0, count);
    const ordered = props?.reverseColumnsOnMobile ? [...visible].reverse() : visible;
    return (
      <div
        style={{
          backgroundColor: style?.backgroundColor ?? undefined,
          padding: style?.padding
            ? `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`
            : undefined,
        }}
      >
        {ordered.map((col, i) => (
          <div key={i}>{col}</div>
        ))}
      </div>
    );
  }

  return <BaseColumnsContainer props={restProps} style={style} columns={editorColumns} />;
}
