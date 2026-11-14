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

import { WorkIcon } from '@/components/exhibition-work';
import type { Work } from '@/types/artworkManage';
import { cn } from '@/utils/cn';

import { WORK_GRID } from './constants';
import { WorkCard } from './WorkCard';

interface OrderScreenProps {
  works: Work[];
  disabled?: boolean;
  onReorder: (works: Work[]) => void;
  onDone: () => void;
}

/* 프로토타입 `.wgrid.edit`: 카드 어디를 눌러도 끌 수 있다. 왼쪽 위 번호, 오른쪽 위 손잡이 */
function SortableWork({ work, index, disabled }: { work: Work; index: number; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: work.id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${index + 1}번째, ${work.title}`}
      aria-roledescription="순서를 바꿀 수 있는 작품"
      className={cn(
        'relative min-w-0 cursor-grab touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:cursor-grabbing',
        isDragging && 'z-10 scale-97 opacity-55',
        disabled && 'cursor-default',
      )}
    >
      <WorkCard
        work={work}
        overlay={
          <>
            <span
              aria-hidden="true"
              className="absolute top-2 left-2 grid size-7 place-items-center rounded-circle bg-[rgba(0,0,0,.5)] text-[12px] font-semibold text-[#fff] tabular-nums"
            >
              {index + 1}
            </span>
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-circle bg-[rgba(255,255,255,.4)] text-[#fff]"
            >
              <WorkIcon name="lines" />
            </span>
          </>
        }
      />
    </li>
  );
}

export function OrderScreen({ works, disabled = false, onReorder, onDone }: OrderScreenProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
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
      <div className="mt-1 flex min-h-10 items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-[#3f3f47]">
          끌어서 순서를 바꾸면 자동으로 저장돼요
        </p>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-8 items-center pl-2 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
        >
          완료
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
          <ul className={cn(WORK_GRID, 'mt-3')}>
            {works.map((work, index) => (
              <SortableWork key={work.id} work={work} index={index} disabled={disabled} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
