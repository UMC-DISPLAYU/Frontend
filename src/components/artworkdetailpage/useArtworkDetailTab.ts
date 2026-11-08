import { useRef } from 'react';

import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';

import type { ArtworkDetailTabKey } from './artworkDetail.utils';

const GUEST_TAB_PARAM = 'guest';

/* 현재 탭을 주소(?tab=guest)에 둡니다. 소개할 내용이 없는 작품은 방명록만 남깁니다. */
export function useArtworkDetailTab(hasIntro: boolean) {
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const navRef = useRef<HTMLDivElement>(null);

  const tabs: ArtworkDetailTabKey[] = hasIntro ? ['intro', 'guest'] : ['guest'];
  const activeTab: ArtworkDetailTabKey =
    !hasIntro || searchParams.get('tab') === GUEST_TAB_PARAM ? 'guest' : 'intro';

  const selectTab = (tab: ArtworkDetailTabKey) => {
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'intro') next.delete('tab');
      else next.set('tab', GUEST_TAB_PARAM);
      return next;
    });

    // 탭 바가 위에 붙어 있을 때 바꾸면 새 탭의 처음부터 보이게 한다.
    // 붙어 있는 동안 탭 바 자신의 위치는 믿을 수 없어 바로 위 이름표를 기준으로 잰다
    const nav = navRef.current;
    const column = nav?.parentElement;
    const label = nav?.previousElementSibling;
    if (!nav || !column || !label) return;

    const navTop =
      label.getBoundingClientRect().bottom + parseFloat(getComputedStyle(nav).marginTop);

    // 900px 이상은 설명란이 자체 스크롤을 가진다
    if (getComputedStyle(column).overflowY === 'auto') {
      const top = navTop - column.getBoundingClientRect().top + column.scrollTop;
      if (column.scrollTop > top) column.scrollTo({ top, behavior: 'auto' });
      return;
    }

    const top = navTop + window.scrollY;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  };

  return { tabs, activeTab, selectTab, navRef };
}
