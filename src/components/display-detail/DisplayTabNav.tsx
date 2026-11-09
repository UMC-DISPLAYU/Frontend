import {
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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
};

/*
 * 탭 줄이 화면 위에 붙었는지. 붙어 있는 동안 900px 미만은 뒤로가기 버튼이 탭 줄 왼쪽에 앉는다.
 * 붙는 위치는 미리보기 띠 · 768px 이상 헤더에 따라 달라서 탭 줄의 실제 sticky top 을 읽는다
 */
function useIsStuck(sentinelRef: RefObject<HTMLDivElement>, navRef: RefObject<HTMLDivElement>) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const nav = navRef.current;
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
  }, [sentinelRef, navRef]);

  return isStuck;
}

export function DisplayTabNav({ activeTab, onTabChange, sentinelRef }: Props) {
  const navRef = useRef<HTMLDivElement>(null);
  const isStuck = useIsStuck(sentinelRef, navRef);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<DisplayDetailTabKey, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<{ x: number; width: number; animate: boolean }>();

  // 밑줄 하나가 탭에서 탭으로 미끄러진다(프로토타입). 처음 자리를 잡을 때는 움직이지 않는다
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const button = buttonRefs.current[activeTab];
      if (!button) return;
      setIndicator((prev) => ({
        x: button.offsetLeft,
        width: button.offsetWidth,
        animate: prev !== undefined,
      }));
    };
    measure();
    // 글꼴이 늦게 들어와 탭 폭이 바뀌어도 맞춘다
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeTab]);

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
        ref={navRef}
        className={cn(
          'sticky top-(--detail-top) z-20 border-b border-bg-tertiary bg-primary-white px-gutter pb-0.5 transition-[padding] duration-fast ease-standard desktop:-ml-1 desktop:px-0',
          // 뒤로가기(왼쪽 20 + 44)를 비켜 첫 탭을 오른쪽으로 민다
          isStuck && 'max-desktop:pl-17',
        )}
      >
        <div ref={listRef} role="tablist" aria-label="전시 상세" className="relative flex gap-2">
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
                  'typography-body-lg-semibold h-9 min-w-12 cursor-pointer px-3 transition duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-96',
                  isActive ? 'text-primary' : 'text-tertiary',
                )}
              >
                {TAB_LABEL[tab]}
              </button>
            );
          })}
          {indicator && (
            <span
              aria-hidden
              className={cn(
                'absolute top-full left-0 h-0.5 bg-primary-black',
                indicator.animate && 'transition-[translate,width] duration-base ease-standard',
              )}
              style={{ translate: `${indicator.x}px 0`, width: indicator.width }}
            />
          )}
        </div>
      </div>
    </>
  );
}
