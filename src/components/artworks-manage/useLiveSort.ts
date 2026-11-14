import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

type Id = number | string;

/* 끌고 있는 항목을 올린 항목 자리로 옮긴다. 같은 자리이거나 찾을 수 없으면 원래 배열을 돌려준다 */
export function moveItem<T extends { id: Id }>(items: T[], draggedId: Id, overId: Id): T[] {
  // data-sort-id 는 문자열이라 id 를 글자로 비교한다
  const from = items.findIndex((item) => String(item.id) === String(draggedId));
  const to = items.findIndex((item) => String(item.id) === String(overId));
  if (from < 0 || to < 0 || from === to) return items;
  const next = items.slice();
  const [dragged] = next.splice(from, 1);
  next.splice(to, 0, dragged);
  return next;
}

const KEY_STEP: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
};

/* 방향키로 한 칸 옮긴 배열. 끝에서 더 가려 하거나 방향키가 아니면 null */
export function moveItemByKey<T extends { id: Id }>(items: T[], id: Id, key: string): T[] | null {
  const step = KEY_STEP[key];
  if (!step) return null;
  const from = items.findIndex((item) => String(item.id) === String(id));
  const target = items[from + step];
  return from < 0 || !target ? null : moveItem(items, id, target.id);
}

/*
 * 프로토타입 works.html `sortable()`: 누른 카드는 제자리에서 흐려지고(떠다니지 않음),
 * 다른 카드 위로 가면 바로 그 자리로 옮겨진다. 손을 떼면 바뀐 순서를 한 번 넘긴다.
 * 항목(목록의 바로 아래 자식)에는 data-sort-id 를 단다. 손잡이에서 시작해도 되고(섹션 `.gr`),
 * 항목 안의 data-sort-ignore 요소(삭제 버튼 등, 프로토타입 `.x` · `.tr`)를 누르면 끌지 않는다
 */
export function useLiveSort<T extends { id: Id }>({
  items,
  disabled = false,
  onSort,
}: {
  items: T[];
  disabled?: boolean;
  onSort: (next: T[]) => void;
}) {
  const [drag, setDrag] = useState<{ id: Id; items: T[] } | null>(null);
  const stopRef = useRef<() => void>(() => undefined);

  // 끄는 도중 화면을 벗어나면 문서에 단 이벤트를 걷는다
  useEffect(() => () => stopRef.current(), []);

  const startDrag = (event: ReactPointerEvent<HTMLElement>, id: Id) => {
    if (disabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest?.('[data-sort-ignore]')) return;
    // 같은 목록 안의 항목 위에서만 옮긴다
    const container = event.currentTarget.closest('[data-sort-id]')?.parentElement;
    if (!container) return;
    event.preventDefault();
    const start = items;
    let current = items;
    setDrag({ id, items: current });

    const move = (moveEvent: PointerEvent) => {
      const target = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest<HTMLElement>('[data-sort-id]');
      if (!target || target.parentElement !== container) return;
      const next = moveItem(current, id, target.dataset.sortId ?? '');
      if (next === current) return;
      current = next;
      setDrag({ id, items: current });
    };
    const stop = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      stopRef.current = () => undefined;
    };
    const end = () => {
      stop();
      setDrag(null);
      if (current !== start) onSort(current);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    stopRef.current = stop;
  };

  return {
    items: drag?.items ?? items,
    draggingId: drag?.id ?? null,
    startDrag,
  };
}
