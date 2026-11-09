import { type RefObject, useEffect, useRef, useState } from 'react';

import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';

/*
 * 탭 줄이 화면 위에 붙었는지. 붙어 있는 동안 900px 미만은 뒤로가기 버튼이 탭 줄 왼쪽에 앉는다.
 * 붙는 위치는 미리보기 띠 · 768px 이상 헤더에 따라 달라서 탭 줄(sentinel 바로 다음)의 실제 sticky top 을 읽는다
 */
function useIsStuck(sentinelRef: RefObject<HTMLDivElement>) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const nav = sentinel?.nextElementSibling;
    if (!sentinel || !nav) return;

    let observer: IntersectionObserver | undefined;
    let observedTop = -1;
    const observe = () => {
      const top = parseFloat(getComputedStyle(nav).top) || 0;
      if (top === observedTop) return;
      observedTop = top;
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < top),
        { rootMargin: `-${top}px 0px 0px 0px` },
      );
      observer.observe(sentinel);
    };

    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, [sentinelRef]);

  return isStuck;
}

/* 현재 탭을 주소(?tab=)에 둔다. 첫 탭은 기본이라 주소에서 뺀다 */
export function useDetailTab<T extends string>(tabs: readonly T[]) {
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isStuck = useIsStuck(sentinelRef);
  const tabParam = searchParams.get('tab');
  const activeTab = tabs.find((tab) => tab === tabParam) ?? tabs[0];

  const selectTab = (tab: T) => {
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === tabs[0]) next.delete('tab');
      else next.set('tab', tab);
      return next;
    });

    // 탭 줄이 위에 붙어 있을 때 바꾸면 새 탭의 처음부터 보이게 한다.
    // 붙어 있는 동안 탭 줄 자신의 위치는 믿을 수 없어 원래 자리(sentinel)를 기준으로 잰다
    const sentinel = sentinelRef.current;
    const nav = sentinel?.nextElementSibling;
    if (!sentinel || !nav) return;
    const stickyTop = parseFloat(getComputedStyle(nav).top) || 0;
    const top = sentinel.getBoundingClientRect().top + window.scrollY - stickyTop;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  };

  return { activeTab, selectTab, sentinelRef, isStuck };
}
