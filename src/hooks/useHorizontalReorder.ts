import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  closestCenter,
  type DndContextProps,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  type Modifier,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@/utils/cn';

/*
 * 가로 사진 줄(포스터 · 작품 이미지)의 끌어서 순서 바꾸기. 프로토타입 reorder.js(U-143)와 같게 맞춘다.
 * - 손가락: 350ms 길게 누르면 집힘. 그 전에 8px 넘게 움직이면 줄 스크롤로 본다
 * - 마우스: 누른 채 4px 넘게 움직이면 바로 집힘
 * - 집힌 칸은 가로로만 따라오고, 첫 칸 · 끝 칸 바깥으로는 덜 따라온다(0.2배)
 * - 줄 양 끝 가까이 끌면 줄이 저절로 넘어간다
 */

const LONG_PRESS_MS = 350;
const TOUCH_SLOP = 8;
const MOUSE_SLOP = 4;
const EDGE_RESISTANCE = 0.2;
const LIFT_SCALE = 1.04;
// 프로토타입은 줄 끝 48px 안으로 끌면 넘어간다. 390px 화면의 줄 폭 기준 비율이다
const AUTO_SCROLL_THRESHOLD = 0.12;
const REORDER_TRANSITION = { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
const ITEM_ATTRIBUTE = 'data-reorder-item';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type ReorderDragMode = 'pointer' | 'keyboard' | null;
type Bounds = { min: number; max: number };

const withEdgeResistance = (value: number, { min, max }: Bounds) => {
  if (value < min) return min + (value - min) * EDGE_RESISTANCE;
  if (value > max) return max + (value - max) * EDGE_RESISTANCE;
  return value;
};

interface UseHorizontalReorderOptions {
  onMove: (activeId: string, overId: string) => void;
}

export function useHorizontalReorder({ onMove }: UseHorizontalReorderOptions) {
  const [dragMode, setDragMode] = useState<ReorderDragMode>(null);
  const boundsRef = useRef<Bounds | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: MOUSE_SLOP } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: LONG_PRESS_MS, tolerance: TOUCH_SLOP },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const modifiers = useMemo<Modifier[]>(
    () => [
      ({ transform }) => ({
        ...transform,
        x: boundsRef.current ? withEdgeResistance(transform.x, boundsRef.current) : transform.x,
        y: 0,
      }),
    ],
    [],
  );

  const handleDragStart = ({ active, activatorEvent }: DragStartEvent) => {
    const isKeyboard = activatorEvent instanceof globalThis.KeyboardEvent;
    setDragMode(isKeyboard ? 'keyboard' : 'pointer');

    const activeNode = document.querySelector<HTMLElement>(
      `[${ITEM_ATTRIBUTE}="${window.CSS.escape(String(active.id))}"]`,
    );
    const items = activeNode?.parentElement
      ? [...activeNode.parentElement.querySelectorAll<HTMLElement>(`:scope > [${ITEM_ATTRIBUTE}]`)]
      : [];
    if (activeNode && items.length > 0) {
      const activeLeft = activeNode.getBoundingClientRect().left;
      boundsRef.current = {
        min: items[0].getBoundingClientRect().left - activeLeft,
        max: items[items.length - 1].getBoundingClientRect().left - activeLeft,
      };
    }

    if (typeof TouchEvent !== 'undefined' && activatorEvent instanceof globalThis.TouchEvent) {
      navigator.vibrate?.(8);
    }
  };

  const finish = () => {
    setDragMode(null);
    boundsRef.current = null;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    finish();
    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  };

  const contextProps: DndContextProps = {
    sensors,
    modifiers,
    collisionDetection: closestCenter,
    // 집힌 칸이 커지기 전 크기로 자리를 잰다(커진 크기로 재면 다른 칸이 한 칸보다 더 비켜난다)
    measuring: { droppable: { strategy: MeasuringStrategy.BeforeDragging } },
    autoScroll: { threshold: { x: AUTO_SCROLL_THRESHOLD, y: 0 } },
    accessibility: {
      screenReaderInstructions: {
        draggable: '스페이스 키로 집고 왼쪽·오른쪽 화살표로 순서를 바꿔요',
      },
      announcements: {
        onDragStart: () => undefined,
        onDragOver: () => undefined,
        onDragEnd: ({ active, over }) => {
          const index = over?.data.current?.sortable?.index;
          return over && active.id !== over.id && typeof index === 'number'
            ? `${index + 1}번째로 옮겼어요`
            : undefined;
        },
        onDragCancel: () => undefined,
      },
    },
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragCancel: finish,
  };

  return { dragMode, contextProps };
}

// 칸 안의 버튼(삭제 · 조정)을 누를 때는 사진을 집지 않는다
const stopPropagation = (event: { stopPropagation: () => void }) => event.stopPropagation();
export const STOP_REORDER_PROPS = {
  onKeyDown: stopPropagation as (event: KeyboardEvent) => void,
  onMouseDown: stopPropagation as (event: MouseEvent) => void,
  onTouchStart: stopPropagation as (event: TouchEvent) => void,
};

/** 줄 안의 사진 칸 하나. 집힌 칸은 조금 커지고 그림자가 생기며, 다른 칸은 200ms 동안 비켜난다 */
export function useHorizontalReorderItem({
  id,
  dragMode,
  disabled = false,
}: {
  id: string;
  dragMode: ReorderDragMode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
    transition: REORDER_TRANSITION,
  });

  // scale 을 transform 안에 넣어야 dnd-kit 이 칸 크기를 잴 때 커진 만큼을 빼고 잰다(scale 속성은 빼지 못한다)
  const isLifted = isDragging && dragMode === 'pointer' && !prefersReducedMotion();
  const translate = CSS.Translate.toString(transform);
  const style: CSSProperties = {
    transform: isLifted ? `${translate ?? ''} scale(${LIFT_SCALE})`.trim() : translate,
    transition: isDragging ? undefined : transition,
  };

  const className = cn(
    'select-none [-webkit-touch-callout:none]',
    !disabled && 'cursor-grab',
    isDragging && 'z-3',
    isDragging &&
      dragMode === 'pointer' &&
      'cursor-grabbing shadow-[0_12px_24px_-8px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.12)]',
    isDragging &&
      dragMode === 'keyboard' &&
      'shadow-[0_12px_24px_-8px_rgba(0,0,0,0.32)] outline-2 outline-offset-2 outline-[#18181b]',
  );

  return {
    setNodeRef,
    style,
    className,
    itemProps: {
      ...attributes,
      ...listeners,
      [ITEM_ATTRIBUTE]: id,
      // 안드로이드에서 길게 누를 때 뜨는 메뉴를 막는다
      onContextMenu: (event: MouseEvent) => event.preventDefault(),
    },
  };
}
