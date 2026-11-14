import { useEffect, useRef, useState } from 'react';

/** 이 안에 끝나면 스켈레톤을 보이지 않는다. index.css 의 --semantic-motion-loading-delay 와 같다 */
export const LOADING_SHOW_DELAY_MS = 150;
/** 한 번 보인 스켈레톤은 최소 이만큼 유지한다(너무 짧게 깜빡이지 않게) */
export const LOADING_MIN_SHOW_MS = 400;

interface SkeletonState {
  prevPending: boolean;
  /** 150ms 가 지나 스켈레톤이 실제로 보이기 시작했다 */
  shown: boolean;
  /** 데이터는 왔지만 최소 유지 시간을 채우는 중 */
  holding: boolean;
  /** 스켈레톤을 보여 준 뒤 실제 내용으로 바뀌었다 */
  revealed: boolean;
}

const initialState = (isPending: boolean): SkeletonState => ({
  prevPending: isPending,
  shown: false,
  holding: false,
  revealed: false,
});

/**
 * React Query `isPending` 을 받아 스켈레톤을 언제 보일지 정한다(디자인 LOADING-SPEC 11-14).
 * - 150ms 안에 끝나면 스켈레톤 없이 바로 실제 내용 (회색 칸 자체도 CSS 가 150ms 동안 숨긴다)
 * - 한 번 보였으면 데이터가 와도 최소 400ms 유지
 * - `skeletonProps` 는 스켈레톤과 실제 목록이 번갈아 들어가는 같은 컨테이너에 붙인다.
 *   스켈레톤 뒤에 나타나는 `animate-rise` 아이템은 올라오지 않고 같은 자리에서 나타나고,
 *   그 안의 OptimizedImage 는 캐시된 사진이어도 흐림이 걷히며 켜진다.
 */
export function useSkeleton(isPending: boolean) {
  const [state, setState] = useState(() => initialState(isPending));
  const shownAtRef = useRef(0);

  // 끝나는 순간 같은 렌더에서 유지 여부를 정해야 실제 내용이 한 프레임 끼어들지 않는다
  if (state.prevPending !== isPending) {
    setState(
      isPending
        ? initialState(true)
        : { prevPending: false, shown: false, holding: state.shown, revealed: state.shown },
    );
  }

  useEffect(() => {
    if (!isPending) return;

    const timer = window.setTimeout(() => {
      shownAtRef.current = performance.now();
      setState((prev) => (prev.prevPending ? { ...prev, shown: true } : prev));
    }, LOADING_SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    if (!state.holding) return;

    const remaining = LOADING_MIN_SHOW_MS - (performance.now() - shownAtRef.current);
    const timer = window.setTimeout(
      () => setState((prev) => ({ ...prev, holding: false })),
      Math.max(0, remaining),
    );

    return () => window.clearTimeout(timer);
  }, [state.holding]);

  const showSkeleton = isPending || state.holding;

  return {
    showSkeleton,
    skeletonProps: {
      'aria-busy': showSkeleton || undefined,
      'data-skeleton': showSkeleton ? 'loading' : state.revealed ? 'revealed' : undefined,
    },
  } as const;
}
