import { type RefObject, useEffect, useRef } from 'react';

const TAP_MOVE_TOLERANCE_PX = 8;
const TAP_MAX_DURATION_MS = 500;
const CLICK_SUPPRESS_MS = 300;

interface PointerStart {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  onControl: boolean;
  moved: boolean;
}

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
    let suppressClickUntil = 0;

    const handlePointerDown = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
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
        onControl: event.target instanceof Element && Boolean(event.target.closest('button, a')),
        moved: false,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!start || start.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_MOVE_TOLERANCE_PX) {
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
        suppressClickUntil = event.timeStamp + CLICK_SUPPRESS_MS;
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
      if (event.timeStamp < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // 카카오 지도가 내부에서 이벤트 전파를 멈춰도 받을 수 있게 캡처 단계에서 듣는다
    element.addEventListener('pointerdown', handlePointerDown, true);
    element.addEventListener('pointermove', handlePointerMove, true);
    element.addEventListener('pointerup', handlePointerUp, true);
    element.addEventListener('pointercancel', handlePointerCancel, true);
    element.addEventListener('click', handleClick, true);
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown, true);
      element.removeEventListener('pointermove', handlePointerMove, true);
      element.removeEventListener('pointerup', handlePointerUp, true);
      element.removeEventListener('pointercancel', handlePointerCancel, true);
      element.removeEventListener('click', handleClick, true);
    };
  }, [ref]);
}
