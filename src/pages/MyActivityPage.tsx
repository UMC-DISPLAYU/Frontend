import { useState } from 'react';

import { useLocation } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { LoungeBoardHeader } from '@/components/lounge-board';

type TabKey = 'written' | 'comments' | 'scraps';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'written', label: '작성한 글' },
  { key: 'comments', label: '내 댓글' },
  { key: 'scraps', label: '스크랩' },
];

function isTabKey(value: unknown): value is TabKey {
  return value === 'written' || value === 'comments' || value === 'scraps';
}

function getTabFromState(state: unknown): TabKey {
  const tab = (state as { tab?: unknown } | null)?.tab;
  return isTabKey(tab) ? tab : 'written';
}

export function MyActivityPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromState(location.state));

  // 같은 경로로 다시 navigate하면 컴포넌트가 리마운트되지 않으므로,
  // location.key(내비게이션마다 고유)가 바뀌면 렌더링 중 탭을 다시 동기화한다.
  const [syncedKey, setSyncedKey] = useState(location.key);
  if (location.key !== syncedKey) {
    setSyncedKey(location.key);
    setActiveTab(getTabFromState(location.state));
  }

  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader title="내 활동" showWriteButton={false} className="px-5" />

      <nav className="mt-[15.5px] px-5 border-b border-zinc-300 flex items-center">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 h-11 flex items-center justify-center border-b-2 ${
                isActive ? 'border-main' : 'border-transparent'
              }`}
            >
              <span
                className={
                  isActive ? 'typo-body-sm-bold text-main' : 'typo-body-sm-regular text-faint'
                }
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10 flex flex-col">
        <ErrorView fullScreen={false} message={`${activeTabLabel} 항목이 없어요.`} />
      </main>
    </div>
  );
}
