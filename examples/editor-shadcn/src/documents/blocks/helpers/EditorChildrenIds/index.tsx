import { Fragment, useState } from 'react';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import { TEditorBlock } from '../../../editor/core';
import { getEditorState } from '../../../editor/EditorContext';
import EditorBlock from '../../../editor/EditorBlock';

import AddBlockButton from './AddBlockMenu';

export type EditorChildrenChange = {
  blockId: string;
  block: TEditorBlock;
  childrenIds: string[];
};

function generateId() {
  return `block-${Date.now()}`;
}

export type EditorChildrenIdsProps = {
  childrenIds: string[] | null | undefined;
  onChange: (val: EditorChildrenChange) => void;
};

/** Blocco trascinabile: maniglia visibile on-hover sul bordo sinistro. */
function SortableBlock({ id }: { id: string }) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn('group/sortable relative', isDragging && 'z-20 opacity-60')}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
    >
      <button
        type="button"
        title={t('dnd.dragHandle')}
        className="absolute top-1/2 -left-0.5 z-10 -translate-y-1/2 cursor-grab rounded-sm bg-background/80 p-0.5 text-muted-foreground opacity-0 shadow-xs outline-none transition-opacity group-hover/sortable:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(ev) => ev.stopPropagation()}
      >
        <GripVertical className="size-4" />
      </button>
      <EditorBlock id={id} />
    </div>
  );
}

export default function EditorChildrenIds({ childrenIds, onChange }: EditorChildrenIdsProps) {
  const [activeDrag, setActiveDrag] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const appendBlock = (block: TEditorBlock) => {
    const blockId = generateId();
    return onChange({
      blockId,
      block,
      childrenIds: [...(childrenIds || []), blockId],
    });
  };

  const insertBlock = (block: TEditorBlock, index: number) => {
    const blockId = generateId();
    const newChildrenIds = [...(childrenIds || [])];
    newChildrenIds.splice(index, 0, blockId);
    return onChange({
      blockId,
      block,
      childrenIds: newChildrenIds,
    });
  };

  const handleDragEnd = (ev: DragEndEvent) => {
    setActiveDrag(false);
    const { active, over } = ev;
    if (!childrenIds || !over || active.id === over.id) {
      return;
    }
    const oldIndex = childrenIds.indexOf(String(active.id));
    const newIndex = childrenIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const reordered = arrayMove(childrenIds, oldIndex, newIndex);
    const movedId = String(active.id);
    const movedBlock = getEditorState().document[movedId];
    if (!movedBlock) {
      return;
    }
    // riusa il contratto onChange: il blocco esistente viene "ri-settato" invariato,
    // l'unico effetto reale è il nuovo ordine di childrenIds
    onChange({ blockId: movedId, block: movedBlock, childrenIds: reordered });
  };

  if (!childrenIds || childrenIds.length === 0) {
    return <AddBlockButton placeholder onSelect={appendBlock} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setActiveDrag(true)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(false)}
    >
      <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
        {childrenIds.map((childId, i) => (
          <Fragment key={childId}>
            {!activeDrag && <AddBlockButton onSelect={(block) => insertBlock(block, i)} />}
            <SortableBlock id={childId} />
          </Fragment>
        ))}
        {!activeDrag && <AddBlockButton onSelect={appendBlock} />}
      </SortableContext>
    </DndContext>
  );
}
