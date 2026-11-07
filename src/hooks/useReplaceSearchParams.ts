import { useCallback } from 'react';

import {
  type NavigateOptions,
  type URLSearchParamsInit,
  useLocation,
  useSearchParams,
} from 'react-router-dom';

type SearchParamsNext = URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit);
type ReplaceSearchParamsOptions = Omit<NavigateOptions, 'replace' | 'preventScrollReset'>;

/**
 * 탭 · 필터 · 정렬처럼 "같은 페이지 안의 상태"를 URL 에 둘 때 쓰는 useSearchParams.
 * 뒤로가기 단계를 쌓지 않고(replace), 스크롤도 그대로 둔다(preventScrollReset).
 * location.state 는 기본으로 유지한다(플로우 상태 등이 지워지지 않게).
 */
export function useReplaceSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentState: unknown = location.state;

  const replaceSearchParams = useCallback(
    (next: SearchParamsNext, options?: ReplaceSearchParamsOptions) => {
      setSearchParams(next, {
        state: currentState,
        ...options,
        replace: true,
        preventScrollReset: true,
      });
    },
    [setSearchParams, currentState],
  );

  return [searchParams, replaceSearchParams] as const;
}
