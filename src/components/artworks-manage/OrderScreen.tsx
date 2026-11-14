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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import DragIcon from '@/assets/exhibition-work/DragIcon.svg';
import type { Work } from '@/types/artworkManage';
import { cn } from '@/utils/cn';

import { WorkCard } from './WorkCard';

interface OrderScreenProps {
  works: Work[];
  disabled?: boolean;
  onReorder: (works: Work[]) => void;
  onDone: () => void;
}

function SortableWork({ work, index, disabled }: { work: Work; index: number; disabled: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: work.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative min-w-0', isDragging && 'z-20 opacity-80')}
    >
      <WorkCard work={work}>
        <span className="typography-body-lg-semibold absolute top-3 left-3 flex size-8 items-center justify-center rounded-circle bg-primary-black/40 text-interactive-inverse">
          {index + 1}
        </span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${work.title} 순서 이동`}
          disabled={disabled}
          className="absolute top-1.5 right-1.5 flex size-11 touch-none cursor-grab items-center justify-center rounded-circle focus-visible:outline-2 focus-visible:outline-focus-inverse active:cursor-grabbing disabled:cursor-default"
        >
          <img src={DragIcon} alt="" />
        </button>
      </WorkCard>
    </li>
  );
}

export function OrderScreen({ works, disabled = false, onReorder, onDone }: OrderScreenProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (disabled || !over || active.id === over.id) return;
    const from = works.findIndex((work) => work.id === active.id);
    const to = works.findIndex((work) => work.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(works, from, to));
  };

  return (
    <>
      <div className="flex min-h-11 items-center justify-between gap-2">
        <p className="typography-body-md-medium text-secondary">순서는 완료하면 저장돼요</p>
        <button
          type="button"
          onClick={onDone}
          disabled={disabled}
          className="typography-body-md-semibold -mr-3 min-h-11 min-w-11 rounded-8 px-3 text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99 disabled:text-disable"
        >
          {disabled ? '저장 중' : '완료'}
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              '스페이스 키로 작품을 선택하고 방향키로 이동하세요. 다시 스페이스 키를 누르면 놓고, Escape 키로 취소합니다.',
          },
        }}
      >
        <SortableContext items={works.map((work) => work.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 tablet:grid-cols-3 desktop:grid-cols-4">
            {works.map((work, index) => (
              <SortableWork key={work.id} work={work} index={index} disabled={disabled} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
