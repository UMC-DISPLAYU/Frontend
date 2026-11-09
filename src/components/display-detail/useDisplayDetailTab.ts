import { useRef } from 'react';

import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';

import { DISPLAY_DETAIL_TABS, type DisplayDetailTabKey } from './displayDetail.utils';

const isTabKey = (value: string | null): value is DisplayDetailTabKey =>
  DISPLAY_DETAIL_TABS.includes(value as DisplayDetailTabKey);

/* 현재 탭을 주소(?tab=works · reviews)에 둔다. 소개는 기본이라 주소에서 뺀다 */
export function useDisplayDetailTab() {
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tabParam = searchParams.get('tab');
  const activeTab: DisplayDetailTabKey = isTabKey(tabParam) ? tabParam : 'intro';

  const selectTab = (tab: DisplayDetailTabKey) => {
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'intro') next.delete('tab');
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

  return { activeTab, selectTab, sentinelRef };
}
