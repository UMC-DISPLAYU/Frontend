import { type RefObject, useEffect, useRef } from 'react';

const TAP_MOVE_TOLERANCE_PX = 8;
// 카카오 지도는 마우스가 3px 넘게 움직이면 끌기를 시작한다. 그만큼 움직였으면 핀 click을 막는다
const MOUSE_DRAG_THRESHOLD_PX = 3;
const TAP_MAX_DURATION_MS = 500;

interface PointerStart {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  threshold: number;
  onControl: boolean;
  moved: boolean;
}

const isOnControl = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('button, a'));

/**
 * 지도 탭 판별(규칙은 mapViewport.ts 맨 위 "지도 바텀시트 규칙").
 * 카카오 지도 click은 터치 기기에서 들어오지 않는 경우가 있어 포인터 이벤트로 직접 판별한다.
 * 핀 위에서 시작해 지도를 끌었으면 손을 뗀 뒤 따라오는 click을 막아 핀이 선택되지 않게 한다.
 */
export function useMapTap(ref: RefObject<HTMLElement | null>, onTap: () => void) {
  const onTapRef = useRef(onTap);

  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const activePointers = new Set<number>();
    let start: PointerStart | null = null;
    let suppressNextClick = false;

    const handlePointerDown = (event: PointerEvent) => {
      // 지도 밖(시트·상단 바)에서 손을 떼면 pointerup을 못 받으므로, 첫 손가락이 닿을 때 기록을 비운다
      if (event.isPrimary) activePointers.clear();
      activePointers.add(event.pointerId);
      suppressNextClick = false;
      if (activePointers.size > 1) {
        // 핀치를 하고 나면 핀이 눌리지 않게 한다
        if (start) start.moved = true;
        return;
      }
      start = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
        threshold: event.pointerType === 'mouse' ? MOUSE_DRAG_THRESHOLD_PX : TAP_MOVE_TOLERANCE_PX,
        onControl: isOnControl(event.target),
        moved: false,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!start || start.moved || start.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > start.threshold) {
        start.moved = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      handlePointerMove(event);
      activePointers.delete(event.pointerId);
      const gesture = start;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      start = null;

      if (gesture.moved) {
        suppressNextClick = gesture.onControl;
        return;
      }
      if (!gesture.onControl && event.timeStamp - gesture.time <= TAP_MAX_DURATION_MS) {
        onTapRef.current();
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      start = null;
    };

    const handleClick = (event: MouseEvent) => {
      if (!suppressNextClick) return;
      suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    // 프로토타입처럼 핀을 두 번 눌러도 지도가 확대되지 않게 한다
    const handleDoubleClick = (event: MouseEvent) => {
      if (isOnControl(event.target)) event.stopPropagation();
    };

    // 카카오 지도가 내부에서 이벤트 전파를 멈춰도 받을 수 있게 캡처 단계에서 듣는다
    element.addEventListener('pointerdown', handlePointerDown, true);
    element.addEventListener('pointermove', handlePointerMove, true);
    element.addEventListener('pointerup', handlePointerUp, true);
    element.addEventListener('pointercancel', handlePointerCancel, true);
    element.addEventListener('click', handleClick, true);
    element.addEventListener('dblclick', handleDoubleClick, true);
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown, true);
      element.removeEventListener('pointermove', handlePointerMove, true);
      element.removeEventListener('pointerup', handlePointerUp, true);
      element.removeEventListener('pointercancel', handlePointerCancel, true);
      element.removeEventListener('click', handleClick, true);
      element.removeEventListener('dblclick', handleDoubleClick, true);
    };
  }, [ref]);
}
