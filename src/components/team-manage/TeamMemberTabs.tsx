import type { KeyboardEvent } from 'react';

import { useTabIndicator } from '@/hooks/useTabIndicator';
import { cn } from '@/utils/cn';

import { getTeamTabIds, type TeamTab } from './teamMembers';

const TABS: { value: TeamTab; label: string }[] = [
  { value: 'joined', label: '참여 중' },
  { value: 'pending', label: '초대 대기' },
];

interface TeamMemberTabsProps {
  tab: TeamTab;
  onChange: (tab: TeamTab) => void;
  /** 팀원 목록을 받기 전에는 개수를 비워 둔다 */
  counts?: Record<TeamTab, number>;
  /** 탭 · 패널 id 를 만든다. 패널은 getTeamTabIds 의 panelId 를 쓴다 */
  idPrefix: string;
}

export function TeamMemberTabs({ tab, onChange, counts, idPrefix }: TeamMemberTabsProps) {
  // 탐색 탭처럼 밑줄 하나가 탭 사이를 미끄러지고, 밑줄은 글자 양옆 여백(px-3)까지 덮는다
  const { listRef, indicator } = useTabIndicator<HTMLDivElement>(tab);
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next =
      event.key === 'ArrowRight' ? 'pending' : event.key === 'ArrowLeft' ? 'joined' : null;
    if (!next) return;
    event.preventDefault();
    onChange(next);
    document.getElementById(getTeamTabIds(idPrefix, next).tabId)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="팀원"
      className="relative mt-6 flex border-b border-[#f0f0f3]"
    >
      {TABS.map(({ value, label }) => {
        const selected = tab === value;
        const { tabId, panelId } = getTeamTabIds(idPrefix, value);

        return (
          <button
            key={value}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(value)}
            onKeyDown={moveFocus}
            className={cn(
              'h-11 shrink-0 cursor-pointer px-3 text-[16px] whitespace-nowrap tabular-nums transition duration-fast ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b] active:scale-96',
              selected
                ? 'font-semibold text-[#18181b]'
                : 'font-medium text-[#71717b] [@media(hover:hover)]:hover:text-[#3f3f47]',
            )}
          >
            {label} {counts?.[value]}
          </button>
        );
      })}
      {indicator && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-px left-0 h-0.5 bg-[#18181b]',
            indicator.animate && 'transition-[translate,width] duration-base ease-standard',
          )}
          style={{ translate: `${indicator.x}px 0`, width: indicator.width }}
        />
      )}
    </div>
  );
}
