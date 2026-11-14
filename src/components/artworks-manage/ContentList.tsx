import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
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
import { CSS } from '@dnd-kit/utilities';

import type { Content } from '@/types';
import { cn } from '@/utils/cn';
import { staggerStyle } from '@/utils/stagger';

import { ContentCard } from './ContentCard';

// 세로 목록이라 옆으로는 움직이지 않게 한다
const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

interface ContentListProps {
  contents: Content[];
  editing: boolean;
  disabled?: boolean;
  onOpen: (content: Content) => void;
  onDelete?: (content: Content) => void;
  onReorder: (contents: Content[]) => void;
}

function SortableContent({
  content,
  index,
  editing,
  disabled,
  onOpen,
  onDelete,
}: {
  content: Content;
  index: number;
  editing: boolean;
  disabled: boolean;
  onOpen: (content: Content) => void;
  onDelete?: (content: Content) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id, disabled: !editing || disabled });

  return (
    <li
      ref={setNodeRef}
      style={{
        ...staggerStyle(index),
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn('relative animate-rise bg-[#fff]', isDragging && 'z-10')}
    >
      <ContentCard
        content={content}
        editing={editing}
        dragging={isDragging}
        onClick={() => onOpen(content)}
        onDelete={onDelete ? () => onDelete(content) : undefined}
        handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </li>
  );
}

/*
 * 프로토타입: 편집 모드에서 손잡이로 끌어 섹션 순서를 바꾸고, 놓을 때 바로 저장한다.
 * 편집 · 완료를 오가도 목록을 다시 그리지 않게(사진 다시 불러오기 · 등장 애니메이션 반복 방지) 같은 틀을 쓴다
 */
export function ContentList({
  contents,
  editing,
  disabled = false,
  onOpen,
  onDelete,
  onReorder,
}: ContentListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (disabled || !over || active.id === over.id) return;
    const from = contents.findIndex((content) => content.id === active.id);
    const to = contents.findIndex((content) => content.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(contents, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            '스페이스 키로 섹션을 선택하고 방향키로 이동하세요. 다시 스페이스 키를 누르면 놓고, Escape 키로 취소합니다.',
        },
      }}
    >
      <SortableContext
        items={contents.map((content) => content.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul>
          {contents.map((content, index) => (
            <SortableContent
              key={content.id}
              content={content}
              index={index}
              editing={editing}
              disabled={disabled}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
