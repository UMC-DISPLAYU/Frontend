import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import {
  DISPLAY_DETAIL_TABS,
  type DisplayDetailTabKey,
  displayPanelId,
  displayTabId,
} from './displayDetail.utils';

const TAB_LABEL: Record<DisplayDetailTabKey, string> = {
  intro: '소개',
  works: '작품',
  reviews: '후기',
};

type Props = {
  activeTab: DisplayDetailTabKey;
  onTabChange: (tab: DisplayDetailTabKey) => void;
  /* 탭 줄이 원래 놓이는 자리. 붙었는지 재고, 탭을 바꿀 때 돌아갈 위치로 쓴다 */
  sentinelRef: RefObject<HTMLDivElement>;
  hasBanner: boolean;
};

/* 탭 줄이 화면 위에 붙었는지. 붙어 있는 동안 900px 미만은 뒤로가기 버튼이 탭 줄 왼쪽에 앉는다 */
function useIsStuck(sentinelRef: RefObject<HTMLDivElement>, topOffset: number) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < topOffset),
      { rootMargin: `-${topOffset}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, topOffset]);

  return isStuck;
}

export function DisplayTabNav({ activeTab, onTabChange, sentinelRef, hasBanner }: Props) {
  const isStuck = useIsStuck(sentinelRef, hasBanner ? 40 : 0);
  const buttonRefs = useRef<Partial<Record<DisplayDetailTabKey, HTMLButtonElement | null>>>({});

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : DISPLAY_DETAIL_TABS.length - 1;
    const next = DISPLAY_DETAIL_TABS[(index + step) % DISPLAY_DETAIL_TABS.length];
    onTabChange(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="invisible -mb-px h-px" />
      <div
        role="tablist"
        aria-label="전시 상세"
        className={cn(
          'sticky z-20 flex gap-2 border-b border-bg-tertiary bg-primary-white px-gutter pb-0.5 transition-[padding] duration-fast ease-standard desktop:-ml-1 desktop:px-0',
          hasBanner ? 'top-10' : 'top-0',
          // 뒤로가기(왼쪽 20 + 44)를 비켜 첫 탭을 오른쪽으로 민다
          isStuck && 'max-desktop:pl-17',
        )}
      >
        {DISPLAY_DETAIL_TABS.map((tab, index) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              ref={(element) => {
                buttonRefs.current[tab] = element;
              }}
              id={displayTabId(tab)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={displayPanelId(tab)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              onKeyDown={(event) => moveFocus(event, index)}
              className={cn(
                'typography-body-lg-semibold relative h-9 min-w-12 cursor-pointer px-3 transition duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-96',
                isActive ? 'text-primary' : 'text-tertiary',
              )}
            >
              {TAB_LABEL[tab]}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary-black"
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
