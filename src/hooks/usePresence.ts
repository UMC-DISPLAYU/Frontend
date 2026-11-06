import { type AnimationEvent, useCallback, useEffect, useState } from 'react';

/** 닫힘 애니메이션(base 300ms)의 animationend 가 오지 않을 때(display: none 등) 대신 언마운트하는 시간 */
export const EXIT_ANIMATION_FALLBACK_MS = 600;

/**
 * open 이 false 가 돼도 닫힘 애니메이션이 끝날 때까지 남겨 둔다.
 * 반환한 onAnimationEnd 를 닫힘 애니메이션이 걸린 요소에 붙인다.
 */
export function usePresence(open: boolean, fallbackMs = EXIT_ANIMATION_FALLBACK_MS) {
  const [isMounted, setIsMounted] = useState(open);

  // 다시 열리면 렌더 중에 바로 마운트 상태로 맞춘다(effect 를 기다리면 한 프레임 비어 보인다)
  if (open && !isMounted) setIsMounted(true);

  const isExiting = isMounted && !open;

  useEffect(() => {
    if (!isExiting) return;

    const timer = window.setTimeout(() => setIsMounted(false), fallbackMs);
    return () => window.clearTimeout(timer);
  }, [isExiting, fallbackMs]);

  const onAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLElement>) => {
      // 안쪽 요소(목록 등장 애니메이션 등)에서 올라온 이벤트는 무시한다
      if (event.target !== event.currentTarget || !isExiting) return;
      setIsMounted(false);
    },
    [isExiting],
  );

  return { isMounted: isMounted || open, isExiting, onAnimationEnd };
}
