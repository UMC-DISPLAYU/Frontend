import type { KeyboardEvent } from 'react';

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
      role="tablist"
      aria-label="팀원"
      className="mt-1.5 flex h-12.25 items-end gap-5 border-b border-primary"
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
              'typography-body-lg-semibold relative -mb-px h-11.25 tabular-nums transition-colors duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              selected
                ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary-black'
                : 'text-tertiary',
            )}
          >
            {label} {counts?.[value]}
          </button>
        );
      })}
    </div>
  );
}
