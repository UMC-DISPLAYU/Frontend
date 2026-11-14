import { WorkIcon } from '@/components/exhibition-work';
import type { Work } from '@/types/artworkManage';
import { cn } from '@/utils/cn';

import { WORK_GRID } from './constants';
import { moveItemByKey, useLiveSort } from './useLiveSort';
import { WorkCard } from './WorkCard';

interface OrderScreenProps {
  works: Work[];
  disabled?: boolean;
  onReorder: (works: Work[]) => void;
  onDone: () => void;
}

/*
 * 프로토타입 `.wgrid.edit`: 카드 어디를 눌러도 끈다. 끄는 카드는 제자리에서 흐려지고(.drag: 투명도 .55 · 97%),
 * 다른 카드 위로 가면 바로 그 자리로 옮겨진다. 손을 떼면 저장한다. 왼쪽 위 번호, 오른쪽 위 손잡이
 */
export function OrderScreen({ works, disabled = false, onReorder, onDone }: OrderScreenProps) {
  const { items, draggingId, startDrag } = useLiveSort({
    items: works,
    disabled,
    onSort: onReorder,
  });

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
      <p id="work-order-help" className="sr-only">
        방향키로 작품 순서를 한 칸씩 옮길 수 있어요
      </p>
      <ul className={cn(WORK_GRID, 'mt-3')}>
        {items.map((work, index) => (
          <li
            key={work.id}
            data-sort-id={work.id}
            tabIndex={disabled ? -1 : 0}
            aria-label={`${index + 1}번째, ${work.title}`}
            aria-describedby="work-order-help"
            onPointerDown={(event) => startDrag(event, work.id)}
            onKeyDown={(event) => {
              if (disabled) return;
              const next = moveItemByKey(works, work.id, event.key);
              if (!next) return;
              event.preventDefault();
              onReorder(next);
            }}
            className={cn(
              'relative min-w-0 cursor-grab touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:cursor-grabbing',
              draggingId === work.id && 'z-[3] scale-97 opacity-55',
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
        ))}
      </ul>
    </>
  );
}
