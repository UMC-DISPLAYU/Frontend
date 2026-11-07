import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { DndContext, KeyboardSensor } from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { beforeEach, expect, it, vi } from 'vitest';

import type { Work } from '@/types/artworkManage';

import { OrderScreen } from './OrderScreen';

const h = vi.hoisted(() => ({ sensor: vi.fn(), reorder: vi.fn() }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: () => null,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: h.sensor,
  useSensors: (...sensors: unknown[]) => sensors,
}));
vi.mock('@dnd-kit/sortable', async (original) => ({
  ...(await original<typeof import('@dnd-kit/sortable')>()),
  SortableContext: () => null,
}));

const works: Work[] = [1, 2, 3].map((id) => ({
  id,
  title: `작품 ${id}`,
  artist: '작가',
  org: '',
  date: '',
  place: '',
  owner: '',
}));
type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = (disabled = false) =>
  nodes(OrderScreen({ works, disabled, onReorder: h.reorder, onDone: vi.fn() }));
const drag = (active: number, over: number | null, disabled = false) =>
  (
    render(disabled).find((node) => node.type === DndContext)!.props.onDragEnd as (
      event: unknown,
    ) => void
  )({ active: { id: active }, over: over === null ? null : { id: over } });

beforeEach(() => vi.clearAllMocks());

it('그리드에 맞는 키보드 좌표와 정렬 전략을 연결한다', () => {
  const tree = render();
  expect(h.sensor).toHaveBeenCalledWith(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sortable = tree.find((node) => node.type === SortableContext)!;
  expect(sortable.props.strategy).toBe(rectSortingStrategy);
  expect(sortable.props.items).toEqual([1, 2, 3]);
});

it('첫 작품을 마지막 위치에 놓으면 전체 ID 순서를 한 번 변경한다', () => {
  drag(1, 3);
  expect(h.reorder).toHaveBeenCalledOnce();
  expect(h.reorder.mock.calls[0][0].map((work: Work) => work.id)).toEqual([2, 3, 1]);
  expect(works.map((work) => work.id)).toEqual([1, 2, 3]);
});

it.each([
  [1, null, false],
  [1, 1, false],
  [9, 1, false],
  [1, 9, false],
  [1, 3, true],
] as const)('드래그 %i → %s, 저장 중 %s인 무효 이동은 무시한다', (active, over, disabled) => {
  drag(active, over, disabled);
  expect(h.reorder).not.toHaveBeenCalled();
});
