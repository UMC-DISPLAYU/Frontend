import { type RefObject, useEffect, useRef, useState } from 'react';

import {
  getNearestSnap,
  getReachableSnaps,
  getSnapPx,
  SHEET_VISIBLE_VAR,
  type SheetSnap,
} from './mapViewport';

const DRAG_THRESHOLD_PX = 4;
const FLING_PROJECTION_MS = 120;
const CLICK_SUPPRESS_MS = 300;

interface DragState {
  startY: number;
  startPx: number;
  currentPx: number;
  startTime: number;
  inBody: boolean;
  mode: 'pending' | 'drag' | 'scroll';
  moved: boolean;
}

interface UseSheetDragOptions {
  rootRef: RefObject<HTMLElement | null>;
  sheetRef: RefObject<HTMLElement | null>;
  bodyRef: RefObject<HTMLElement | null>;
  snap: SheetSnap;
  snapOptions: SheetSnap[];
  fullPx: number;
  disabled: boolean;
  onSnapChange: (snap: SheetSnap) => void;
}

/**
 * 바텀시트 끌기. 동작 규칙은 mapViewport.ts 맨 위 "지도 바텀시트 규칙"에 있다.
 * 끄는 동안에는 리렌더 없이 CSS 변수만 바꾼다. 스크롤과 우선순위를 정하려면 touchmove를 막아야 해서
 * (React 터치 이벤트는 passive라 못 막음) 시트 요소에 직접 리스너를 붙인다.
 */
export function useSheetDrag({
  rootRef,
  sheetRef,
  bodyRef,
  snap,
  snapOptions,
  fullPx,
  disabled,
  onSnapChange,
}: UseSheetDragOptions) {
  const dragRef = useRef<DragState | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || disabled) return;

    const reachable = getReachableSnaps(snapOptions, snap);
    const minPx = getSnapPx(reachable[0], fullPx);
    const maxPx = getSnapPx(reachable[reachable.length - 1], fullPx);

    const setVisiblePx = (px: number) => {
      rootRef.current?.style.setProperty(SHEET_VISIBLE_VAR, `${px}px`);
    };

    const begin = (clientY: number, target: EventTarget | null, timeStamp: number) => {
      const startPx = getSnapPx(snap, fullPx);
      dragRef.current = {
        startY: clientY,
        startPx,
        currentPx: startPx,
        startTime: timeStamp,
        inBody: target instanceof Node && Boolean(bodyRef.current?.contains(target)),
        mode: 'pending',
        moved: false,
      };
    };

    /** 처리했으면 true(브라우저 스크롤을 막아야 함) */
    const move = (clientY: number) => {
      const drag = dragRef.current;
      if (!drag || drag.mode === 'scroll') return false;

      const delta = drag.startY - clientY;
      if (drag.mode === 'pending') {
        if (delta === 0) return false;
        const body = bodyRef.current;
        const canScroll =
          snap === 'full' && drag.inBody && !!body && body.scrollHeight > body.clientHeight;
        if (canScroll && (body.scrollTop > 0 || delta > 0)) {
          drag.mode = 'scroll';
          return false;
        }
        drag.mode = 'drag';
      }

      if (!drag.moved) {
        if (Math.abs(delta) <= DRAG_THRESHOLD_PX) return true;
        drag.moved = true;
        setIsDragging(true);
      }

      drag.currentPx = Math.min(maxPx, Math.max(minPx, drag.startPx + delta));
      setVisiblePx(drag.currentPx);
      return true;
    };

    const end = (timeStamp: number) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || drag.mode !== 'drag' || !drag.moved) return;

      setIsDragging(false);
      suppressClickUntilRef.current = timeStamp + CLICK_SUPPRESS_MS;
      const velocity = (drag.currentPx - drag.startPx) / Math.max(1, timeStamp - drag.startTime);
      const next = getNearestSnap(
        reachable,
        drag.currentPx + velocity * FLING_PROJECTION_MS,
        fullPx,
      );
      // 같은 높이로 돌아오면 React가 style을 다시 쓰지 않으므로 직접 맞춘다
      setVisiblePx(getSnapPx(next, fullPx));
      onSnapChange(next);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        dragRef.current = null;
        return;
      }
      begin(event.touches[0].clientY, event.target, event.timeStamp);
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (move(event.touches[0].clientY) && event.cancelable) event.preventDefault();
    };
    const handleTouchEnd = (event: TouchEvent) => end(event.timeStamp);

    // 마우스(데스크톱 브라우저를 좁혀 쓰는 경우)는 터치 이벤트가 없어 포인터로 받는다
    const handleMouseMove = (event: PointerEvent) => move(event.clientY);
    const handleMouseUp = (event: PointerEvent) => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
      end(event.timeStamp);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      begin(event.clientY, event.target, event.timeStamp);
      window.addEventListener('pointermove', handleMouseMove);
      window.addEventListener('pointerup', handleMouseUp);
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (event.timeStamp < suppressClickUntilRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    sheet.addEventListener('touchstart', handleTouchStart, { passive: true });
    sheet.addEventListener('touchmove', handleTouchMove, { passive: false });
    sheet.addEventListener('touchend', handleTouchEnd);
    sheet.addEventListener('touchcancel', handleTouchEnd);
    sheet.addEventListener('pointerdown', handlePointerDown);
    sheet.addEventListener('click', handleClickCapture, true);

    return () => {
      sheet.removeEventListener('touchstart', handleTouchStart);
      sheet.removeEventListener('touchmove', handleTouchMove);
      sheet.removeEventListener('touchend', handleTouchEnd);
      sheet.removeEventListener('touchcancel', handleTouchEnd);
      sheet.removeEventListener('pointerdown', handlePointerDown);
      sheet.removeEventListener('click', handleClickCapture, true);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [rootRef, sheetRef, bodyRef, snap, snapOptions, fullPx, disabled, onSnapChange]);

  return { isDragging };
}
