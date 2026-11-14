import { type RefObject, useLayoutEffect } from 'react';

// 프로토타입 sw-in: 아래 10px 에서 .36s 동안 올라오며 나타나고, 앞 5칸만 40ms 씩 시차를 둔다
const SWAP_IN_KEYFRAMES: Keyframe[] = [{ opacity: 0, transform: 'translateY(10px)' }, {}];
const SWAP_IN_DURATION = 360;
const SWAP_IN_STAGGER = 40;
const SWAP_IN_MAX_STEPS = 4;
const SWAP_IN_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** 탭을 바꿔 새로 그린 목록의 칸(목록 요소의 자식)이 차례로 올라오며 나타난다 */
export function useSwapIn(listRef: RefObject<HTMLElement>, enabled: boolean | undefined) {
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animations = Array.from(list.children, (child, index) =>
      child.animate(SWAP_IN_KEYFRAMES, {
        duration: SWAP_IN_DURATION,
        delay: Math.min(index, SWAP_IN_MAX_STEPS) * SWAP_IN_STAGGER,
        easing: SWAP_IN_EASING,
        fill: 'backwards',
      }),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [listRef, enabled]);
}
