import { type KeyboardEvent, useRef } from 'react';

import type { TabKey } from '@/types/mypage';
import { cn } from '@/utils/cn';

import { ARCHIVE_PANEL_ID, archiveTabId } from './archiveTabIds';

const ARCHIVE_TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

type ArchiveTabsProps = {
  activeTab: TabKey;
  /** 탭 옆 저장 수. 0 이거나 아직 모르면 숫자를 보이지 않는다 */
  counts: Partial<Record<TabKey, number>>;
  onChange: (tab: TabKey) => void;
};

export function ArchiveTabs({ activeTab, counts, onChange }: ArchiveTabsProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const current = ARCHIVE_TABS.findIndex((tab) => tab.key === activeTab);
    const step = event.key === 'ArrowRight' ? 1 : ARCHIVE_TABS.length - 1;
    const next = (current + step) % ARCHIVE_TABS.length;
    onChange(ARCHIVE_TABS[next].key);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      aria-label="보관함"
      className="grid grid-cols-3 gap-1 rounded-circle bg-secondary p-1"
      onKeyDown={handleKeyDown}
      role="tablist"
    >
      {ARCHIVE_TABS.map((tab, index) => {
        const isActive = tab.key === activeTab;
        const count = counts[tab.key];
        return (
          <button
            aria-controls={ARCHIVE_PANEL_ID}
            aria-selected={isActive}
            className={cn(
              'h-10 rounded-circle tabular-nums transition-colors duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              isActive
                ? 'typography-body-lg-semibold bg-primary-black text-quaternary'
                : 'typography-body-lg-medium text-secondary',
            )}
            id={archiveTabId(tab.key)}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {tab.label}
            {count ? ` ${count}` : ''}
          </button>
        );
      })}
    </div>
  );
}
