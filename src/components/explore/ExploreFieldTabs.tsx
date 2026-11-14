import { type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useTabIndicator } from '@/hooks/useTabIndicator';
import { cn } from '@/utils/cn';

import type { ExploreOption } from './exploreOptions';

type ExploreFieldTabsProps = {
  options: readonly ExploreOption[];
  selectedLabel: string;
  onSelect: (option: ExploreOption) => void;
  tabId: (index: number) => string;
  panelId: string;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ExploreFieldTabs({
  options,
  selectedLabel,
  onSelect,
  tabId,
  panelId,
}: ExploreFieldTabsProps) {
  const { listRef, indicator } = useTabIndicator<HTMLDivElement>(selectedLabel);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isStuck, setIsStuck] = useState(false);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.label === selectedLabel),
  );

  // 고른 탭이 가로 스크롤 가운데에 오게 한다. scrollIntoView 는 페이지 세로 스크롤까지 건드려 가로만 옮긴다
  const centerTab = (index: number, behavior: ScrollBehavior) => {
    const scroller = scrollerRef.current;
    const tab = buttonRefs.current[index];
    if (!scroller || !tab) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const delta = tabRect.left + tabRect.width / 2 - (scrollerRect.left + scrollerRect.width / 2);
    scroller.scrollBy({ left: delta, behavior });
  };

  // 처음 들어왔을 때(주소에 분야가 있을 때) 고른 탭이 보이게 한다
  useLayoutEffect(() => {
    centerTab(selectedIndex, 'auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 처음 한 번만 맞춘다
  }, []);

  // 분야 탭이 화면 맨 위에 붙으면 아래에 옅은 선을 그린다
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => {
    onSelect(options[index]);
    centerTab(index, prefersReducedMotion() ? 'auto' : 'smooth');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight' ? Math.min(index + 1, options.length - 1) : Math.max(index - 1, 0);
    select(next);
    buttonRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <>
      <div aria-hidden="true" className="invisible mt-3 -mb-px h-px" ref={sentinelRef} />
      <div
        className={cn(
          'sticky top-0 z-30 -mx-5 bg-[#fff] tablet:-mx-8 min-[68.75rem]:-mx-12 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:-z-10 after:h-px after:bg-[#f0f0f3] after:opacity-0 after:transition-opacity after:duration-fast after:ease-standard',
          isStuck && 'after:opacity-100',
        )}
      >
        <div
          className="overflow-x-auto px-5 [scrollbar-width:none] tablet:px-8 min-[68.75rem]:px-12 [&::-webkit-scrollbar]:hidden"
          ref={scrollerRef}
        >
          <div
            aria-label="분야"
            className="relative flex w-max min-[900px]:mx-auto"
            ref={listRef}
            role="tablist"
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  aria-controls={panelId}
                  aria-selected={isSelected}
                  className={cn(
                    'typography-body-xl-semibold h-10 shrink-0 cursor-pointer px-3 whitespace-nowrap transition duration-fast ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b] active:scale-96',
                    isSelected
                      ? 'text-[#18181b]'
                      : 'text-[#d4d4d8] [@media(hover:hover)]:hover:text-[#71717b]',
                  )}
                  id={tabId(index)}
                  key={option.label}
                  onClick={() => select(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  ref={(element) => {
                    buttonRefs.current[index] = element;
                  }}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
            {indicator && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute bottom-0 left-0 h-0.5 bg-[#18181b]',
                  indicator.animate && 'transition-[translate,width] duration-base ease-standard',
                )}
                style={{ translate: `${indicator.x}px 0`, width: indicator.width }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
