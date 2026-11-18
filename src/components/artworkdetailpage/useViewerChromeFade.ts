import { type FocusEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { isDesktopViewport } from './artworkDetail.utils';

const IDLE_MS = 3000;
const DESKTOP_IDLE_MS = 1500;
const CHIP_IDLE_MS = 1600;
const STACK_SCROLL_THRESHOLD = 10;
const STACK_TOP_ZONE = 80;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 마우스로 누른 버튼도 크롬에선 초점을 받는다. 그 초점까지 잡아 두면 900px 이상에서 흐려지지 않으므로 키보드 초점만 센다
const isKeyboardFocus = (element: Element) => {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
};

type FadeOptions = {
  onIdleChange: (idle: boolean) => void;
  onChipIdleChange: (idle: boolean) => void;
  isDesktop: () => boolean;
  prefersReducedMotion: () => boolean;
};

/**
 * 사진 위 컨트롤(보기 방식 · 장수 칩)이 작품을 가리지 않게 한다. 움직임 줄이기면 그대로 둔다(프로토타입 fade.js).
 * - 보기 방식: 가만히 있으면 흐려지기만 하고(55%) 계속 누를 수 있다. 올리거나 초점이 가면 또렷해진다.
 *   - 900px 미만: 3초 동안 건드리지 않으면 흐려진다(프로토타입).
 *   - 900px 이상: 보기 방식을 1.5초 동안 누르지 않거나 그 밖을 누르면 바로 흐려진다(사용자 결정).
 * - 장수 칩: 넘긴 직후에만 잠깐 보인다.
 * - 이어서: 아래로 내리면 바로 흐려지고(칩은 숨김), 위로 올리거나 맨 위에서는 다시 또렷해진다.
 */
export function createChromeFade(options: FadeOptions) {
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let chipTimer: ReturnType<typeof setTimeout> | undefined;
  let isIdle = false;
  let isHovered = false;
  let isFocused = false;

  const isHeld = () => isHovered || isFocused;

  const setIdle = (idle: boolean) => {
    isIdle = idle;
    options.onIdleChange(idle);
  };

  const clearTimers = () => {
    clearTimeout(idleTimer);
    clearTimeout(chipTimer);
  };

  const armIdle = () => {
    clearTimeout(idleTimer);
    if (options.prefersReducedMotion()) return;
    idleTimer = setTimeout(
      () => {
        if (!isHeld()) setIdle(true);
      },
      options.isDesktop() ? DESKTOP_IDLE_MS : IDLE_MS,
    );
  };

  const armChip = () => {
    clearTimeout(chipTimer);
    if (options.prefersReducedMotion()) return;
    chipTimer = setTimeout(() => {
      if (!isHeld()) options.onChipIdleChange(true);
    }, CHIP_IDLE_MS);
  };

  const wake = () => {
    setIdle(false);
    options.onChipIdleChange(false);
    armChip();
    armIdle();
  };

  const dim = () => {
    clearTimeout(idleTimer);
    if (options.prefersReducedMotion()) return;
    setIdle(true);
  };

  return {
    wake,
    clearTimers,
    peekChip: () => {
      options.onChipIdleChange(false);
      armChip();
    },
    hideForScroll: () => {
      clearTimers();
      setIdle(true);
    },
    pointerDown: ({ inControls, inStage }: { inControls: boolean; inStage: boolean }) => {
      if (!options.isDesktop()) {
        if (inStage) wake();
        return;
      }
      if (inControls) wake();
      else dim();
    },
    // 900px 이상은 누를 때만 또렷해진다. 사진 위를 움직이면 깨우던 것은 900px 미만에만 남긴다
    pointerMove: (isMouse: boolean) => {
      if (isMouse && isIdle && !options.isDesktop()) wake();
    },
    enter: () => {
      isHovered = true;
      wake();
    },
    leave: () => {
      isHovered = false;
      wake();
    },
    focus: (byKeyboard: boolean) => {
      if (options.isDesktop() && !byKeyboard) return;
      isFocused = true;
      wake();
    },
    // 900px 이상에서 밖을 눌러 초점이 빠지면 흐려진 채로 둔다
    blur: () => {
      if (!isFocused) return;
      isFocused = false;
      if (options.isDesktop()) armIdle();
      else wake();
    },
  };
}

export function useViewerChromeFade(stageRef: RefObject<HTMLElement>, isStack: boolean) {
  const [isIdle, setIsIdle] = useState(false);
  const [isChipIdle, setIsChipIdle] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [fade] = useState(() =>
    createChromeFade({
      onIdleChange: setIsIdle,
      onChipIdleChange: setIsChipIdle,
      isDesktop: isDesktopViewport,
      prefersReducedMotion,
    }),
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      fade.pointerDown({
        inControls: !!controlsRef.current?.contains(target),
        inStage: stage.contains(target),
      });
    };
    const onPointerMove = (event: PointerEvent) => fade.pointerMove(event.pointerType === 'mouse');

    fade.wake();
    document.addEventListener('pointerdown', onPointerDown, true);
    stage.addEventListener('pointermove', onPointerMove);
    document.addEventListener('keydown', fade.wake);
    return () => {
      fade.clearTimers();
      document.removeEventListener('pointerdown', onPointerDown, true);
      stage.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('keydown', fade.wake);
    };
  }, [stageRef, fade]);

  useEffect(() => {
    if (!isStack || prefersReducedMotion()) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (delta > STACK_SCROLL_THRESHOLD && y > STACK_TOP_ZONE) {
        fade.hideForScroll();
        lastY = y;
      } else if (delta < -STACK_SCROLL_THRESHOLD || y <= STACK_TOP_ZONE) {
        fade.wake();
        lastY = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isStack, fade]);

  return {
    /* 보기 방식을 흐리게(한 장씩 · 이어서 모두) */
    isControlsDimmed: isIdle,
    isChipHidden: isStack ? isIdle : isChipIdle,
    peekChip: fade.peekChip,
    holdProps: {
      ref: controlsRef,
      onMouseEnter: fade.enter,
      onMouseLeave: fade.leave,
      onFocus: (event: FocusEvent<HTMLElement>) => fade.focus(isKeyboardFocus(event.target)),
      onBlur: fade.blur,
    },
  };
}

export type ViewerChrome = ReturnType<typeof useViewerChromeFade>;
