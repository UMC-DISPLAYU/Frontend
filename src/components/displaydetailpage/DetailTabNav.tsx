import type { DetailTabKey } from '@/types/exhibition';
import { cn } from '@/utils/cn';

const DETAIL_TABS: { key: DetailTabKey; label: string }[] = [
  { key: 'intro', label: '소개' },
  { key: 'artwork', label: '작품' },
  { key: 'review', label: '후기' },
];

type Props = {
  activeTab: DetailTabKey;
  onTabChange: (key: DetailTabKey) => void;
};

export function DetailTabNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="bg-page sticky top-0 z-10 border-b-2 border-line-soft flex px-5 gap-10">
      {DETAIL_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'py-4 typo-body-sm-regular transition-all duration-150 relative whitespace-nowrap',
              isActive ? 'text-main font-bold' : 'text-faint',
            )}
          >
            {tab.label}
            {isActive && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-main" />}
          </button>
        );
      })}
    </nav>
  );
}
