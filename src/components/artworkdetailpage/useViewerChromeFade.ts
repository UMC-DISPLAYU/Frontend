import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

const IDLE_MS = 3000;
const CHIP_IDLE_MS = 1600;
const STACK_SCROLL_THRESHOLD = 10;
const STACK_TOP_ZONE = 80;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 사진 위 컨트롤(뒤로가기 · 보기 방식 · 장수 칩)이 작품을 가리지 않게 한다. 움직임 줄이기면 그대로 둔다.
 * - 한 장씩: 3초 가만히 있으면 보기 방식이 흐려지고, 장수 칩은 넘긴 직후에만 잠깐 보인다.
 * - 이어서(디자이너 메모): 아래로 내리거나 3초 가만히 있으면 모두 숨고, 위로 올리거나 맨 위에서는 다시 보인다.
 */
export function useViewerChromeFade(stageRef: RefObject<HTMLElement>, isStack: boolean) {
  const [isIdle, setIsIdle] = useState(false);
  const [isChipIdle, setIsChipIdle] = useState(false);

  const idleTimerRef = useRef(0);
  const chipTimerRef = useRef(0);
  const holdCountRef = useRef(0);
  const isIdleRef = useRef(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    window.clearTimeout(chipTimerRef.current);
  }, []);

  const armChipTimer = useCallback(() => {
    window.clearTimeout(chipTimerRef.current);
    if (prefersReducedMotion()) return;
    chipTimerRef.current = window.setTimeout(() => {
      if (holdCountRef.current === 0) setIsChipIdle(true);
    }, CHIP_IDLE_MS);
  }, []);

  const setIdle = useCallback((idle: boolean) => {
    isIdleRef.current = idle;
    setIsIdle(idle);
  }, []);

  const wake = useCallback(() => {
    setIdle(false);
    setIsChipIdle(false);
    window.clearTimeout(idleTimerRef.current);
    armChipTimer();
    if (prefersReducedMotion()) return;
    idleTimerRef.current = window.setTimeout(() => {
      if (holdCountRef.current === 0) setIdle(true);
    }, IDLE_MS);
  }, [armChipTimer, setIdle]);

  const peekChip = useCallback(() => {
    setIsChipIdle(false);
    armChipTimer();
  }, [armChipTimer]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && isIdleRef.current) wake();
    };

    wake();
    stage.addEventListener('pointerdown', wake);
    stage.addEventListener('pointermove', onPointerMove);
    document.addEventListener('keydown', wake);
    return () => {
      clearTimers();
      stage.removeEventListener('pointerdown', wake);
      stage.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('keydown', wake);
    };
  }, [stageRef, wake, clearTimers]);

  useEffect(() => {
    if (!isStack || prefersReducedMotion()) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (delta > STACK_SCROLL_THRESHOLD && y > STACK_TOP_ZONE) {
        clearTimers();
        setIdle(true);
        lastY = y;
      } else if (delta < -STACK_SCROLL_THRESHOLD || y <= STACK_TOP_ZONE) {
        wake();
        lastY = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isStack, wake, clearTimers, setIdle]);

  const hold = useCallback(() => {
    holdCountRef.current += 1;
    wake();
  }, [wake]);

  const release = useCallback(() => {
    holdCountRef.current = Math.max(0, holdCountRef.current - 1);
    wake();
  }, [wake]);

  return {
    /* 이어서 보기에서 컨트롤을 모두 숨기는 중 */
    isStackHidden: isStack && isIdle,
    /* 한 장씩 보기에서 보기 방식을 흐리게 */
    isControlsDimmed: !isStack && isIdle,
    isChipHidden: isStack ? isIdle : isChipIdle,
    peekChip,
    holdProps: { onMouseEnter: hold, onMouseLeave: release, onFocus: hold, onBlur: release },
  };
}

export type ViewerChrome = ReturnType<typeof useViewerChromeFade>;
