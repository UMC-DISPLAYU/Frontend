import { type KeyboardEvent, type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

type Props<T extends string> = {
  tabs: readonly T[];
  labels: Record<T, string>;
  /* tablist 이름. 예: "전시 상세" */
  label: string;
  tabId: (tab: T) => string;
  panelId: (tab: T) => string;
  activeTab: T;
  onTabChange: (tab: T) => void;
  /* 탭 줄이 원래 놓이는 자리. 붙었는지 재고, 탭을 바꿀 때 돌아갈 위치로 쓴다(useDetailTab) */
  sentinelRef: RefObject<HTMLDivElement>;
  isStuck: boolean;
};

export function DetailTabNav<T extends string>({
  tabs,
  labels,
  label,
  tabId,
  panelId,
  activeTab,
  onTabChange,
  sentinelRef,
  isStuck,
}: Props<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
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
    const step = event.key === 'ArrowRight' ? 1 : tabs.length - 1;
    const next = tabs[(index + step) % tabs.length];
    onTabChange(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="invisible -mb-px h-px" />
      <div
        className={cn(
          'sticky top-(--detail-top) z-20 border-b border-bg-tertiary bg-primary-white px-gutter pb-0.5 transition-[padding] duration-fast ease-standard desktop:-ml-1 desktop:px-0',
          // 뒤로가기(왼쪽 20 + 44)를 비켜 첫 탭을 오른쪽으로 민다
          isStuck && 'max-desktop:pl-17',
        )}
      >
        <div ref={listRef} role="tablist" aria-label={label} className="relative flex gap-2">
          {tabs.map((tab, index) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                ref={(element) => {
                  buttonRefs.current[tab] = element;
                }}
                id={tabId(tab)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId(tab)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab)}
                onKeyDown={(event) => moveFocus(event, index)}
                className={cn(
                  'typography-body-lg-semibold h-9 min-w-12 cursor-pointer px-3 transition duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-96',
                  isActive ? 'text-primary' : 'text-tertiary',
                )}
              >
                {labels[tab]}
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
