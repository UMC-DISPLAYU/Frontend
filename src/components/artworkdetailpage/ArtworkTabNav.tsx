import { cn } from '@/utils/cn';

type Props = {
  activeTab: 'intro' | 'guestbook';
  onTabChange: (tab: 'intro' | 'guestbook') => void;
};

export function ArtworkTabNav({ activeTab, onTabChange }: Props) {
  const tabs: { key: 'intro' | 'guestbook'; label: string }[] = [
    { key: 'intro', label: '소개' },
    { key: 'guestbook', label: '방명록' },
  ];

  return (
    <nav className="bg-page sticky top-0 z-10 border-b-2 border-line-soft flex px-5 gap-5.5">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            id={`artwork-tab-${tab.key}`}
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
