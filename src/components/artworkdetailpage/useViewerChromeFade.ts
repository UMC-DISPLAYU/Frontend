import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

const CONTROLS_IDLE_MS = 3000;
const CHIP_IDLE_MS = 1600;
const STACK_SCROLL_THRESHOLD = 10;
const STACK_TOP_ZONE = 80;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 사진 위 컨트롤이 작품을 가리지 않게 한다.
 * 보기 방식 스위치는 3초 가만히 있으면 흐려지고, 장수 칩은 넘긴 직후에만 잠깐 보인다.
 * 이어서 보기에서는 아래로 내리면 숨기고 위로 올리면 다시 보여준다.
 */
export function useViewerChromeFade(stageRef: RefObject<HTMLElement>, isStack: boolean) {
  const [isControlsIdle, setIsControlsIdle] = useState(false);
  const [isChipIdle, setIsChipIdle] = useState(false);

  const controlsTimerRef = useRef(0);
  const chipTimerRef = useRef(0);
  const holdCountRef = useRef(0);
  const isControlsIdleRef = useRef(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(controlsTimerRef.current);
    window.clearTimeout(chipTimerRef.current);
  }, []);

  const armChipTimer = useCallback(() => {
    window.clearTimeout(chipTimerRef.current);
    if (prefersReducedMotion()) return;
    chipTimerRef.current = window.setTimeout(() => {
      if (holdCountRef.current === 0) setIsChipIdle(true);
    }, CHIP_IDLE_MS);
  }, []);

  const setControlsIdle = useCallback((idle: boolean) => {
    isControlsIdleRef.current = idle;
    setIsControlsIdle(idle);
  }, []);

  const wake = useCallback(() => {
    setControlsIdle(false);
    setIsChipIdle(false);
    window.clearTimeout(controlsTimerRef.current);
    armChipTimer();
    if (prefersReducedMotion()) return;
    controlsTimerRef.current = window.setTimeout(() => {
      if (holdCountRef.current === 0) setControlsIdle(true);
    }, CONTROLS_IDLE_MS);
  }, [armChipTimer, setControlsIdle]);

  const peekChip = useCallback(() => {
    setIsChipIdle(false);
    armChipTimer();
  }, [armChipTimer]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && isControlsIdleRef.current) wake();
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
        setControlsIdle(true);
        setIsChipIdle(true);
        lastY = y;
      } else if (delta < -STACK_SCROLL_THRESHOLD || y <= STACK_TOP_ZONE) {
        wake();
        lastY = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isStack, wake, clearTimers, setControlsIdle]);

  const hold = useCallback(() => {
    holdCountRef.current += 1;
    wake();
  }, [wake]);

  const release = useCallback(() => {
    holdCountRef.current = Math.max(0, holdCountRef.current - 1);
    wake();
  }, [wake]);

  return {
    isControlsIdle,
    isChipIdle,
    peekChip,
    holdProps: { onMouseEnter: hold, onMouseLeave: release, onFocus: hold, onBlur: release },
  };
}
