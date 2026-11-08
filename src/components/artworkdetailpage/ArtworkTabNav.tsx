import { type KeyboardEvent, type RefObject, useRef } from 'react';

import { cn } from '@/utils/cn';

import { type ArtworkDetailTabKey, artworkPanelId, artworkTabId } from './artworkDetail.utils';

const TAB_LABEL: Record<ArtworkDetailTabKey, string> = {
  intro: '소개',
  guest: '방명록',
};

type Props = {
  tabs: ArtworkDetailTabKey[];
  activeTab: ArtworkDetailTabKey;
  onTabChange: (tab: ArtworkDetailTabKey) => void;
  navRef?: RefObject<HTMLDivElement>;
};

export function ArtworkTabNav({ tabs, activeTab, onTabChange, navRef }: Props) {
  const buttonRefs = useRef<Partial<Record<ArtworkDetailTabKey, HTMLButtonElement | null>>>({});

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : tabs.length - 1;
    const next = tabs[(index + step) % tabs.length];
    onTabChange(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      ref={navRef}
      role="tablist"
      aria-label="작품 상세"
      className="sticky top-0 z-10 mt-3 flex gap-2 border-b border-bg-tertiary bg-primary-white px-[calc(var(--semantic-layout-gutter)-16px)] desktop:-ml-2 desktop:px-0"
    >
      {tabs.map((tab, index) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            ref={(element) => {
              buttonRefs.current[tab] = element;
            }}
            id={artworkTabId(tab)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={artworkPanelId(tab)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab)}
            onKeyDown={(event) => moveFocus(event, index)}
            className={cn(
              'typography-body-lg-semibold relative h-12 cursor-pointer px-4 transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
              isActive ? 'text-primary' : 'text-tertiary',
            )}
          >
            {TAB_LABEL[tab]}
            {isActive && (
              <span
                aria-hidden
                className="absolute right-3 -bottom-px left-3 h-0.5 bg-primary-black"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
