import { type RefObject, useEffect, useRef } from 'react';

const TAP_MOVE_TOLERANCE_PX = 8;
const TAP_MAX_DURATION_MS = 500;

interface TapStart {
  pointerId: number;
  x: number;
  y: number;
  time: number;
}

/**
 * 지도 탭 판별(규칙은 mapViewport.ts 맨 위 "지도 바텀시트 규칙").
 * 카카오 지도 click은 터치 기기에서 들어오지 않는 경우가 있어 포인터 이벤트로 직접 판별한다.
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
    let start: TapStart | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
      const onControl = event.target instanceof Element && event.target.closest('button, a');
      start =
        activePointers.size === 1 && !onControl
          ? {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              time: event.timeStamp,
            }
          : null;
    };

    const handlePointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      const tap = start;
      start = null;
      if (!tap || tap.pointerId !== event.pointerId) return;

      const moved = Math.hypot(event.clientX - tap.x, event.clientY - tap.y);
      if (moved <= TAP_MOVE_TOLERANCE_PX && event.timeStamp - tap.time <= TAP_MAX_DURATION_MS) {
        onTapRef.current();
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      start = null;
    };

    // 카카오 지도가 내부에서 이벤트 전파를 멈춰도 받을 수 있게 캡처 단계에서 듣는다
    element.addEventListener('pointerdown', handlePointerDown, true);
    element.addEventListener('pointerup', handlePointerUp, true);
    element.addEventListener('pointercancel', handlePointerCancel, true);
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown, true);
      element.removeEventListener('pointerup', handlePointerUp, true);
      element.removeEventListener('pointercancel', handlePointerCancel, true);
    };
  }, [ref]);
}
