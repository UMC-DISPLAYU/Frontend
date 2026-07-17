import type { DetailTabKey } from '@/types/exhibition';

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
    <nav className="bg-[#F0F0F3] sticky top-0 z-10 border-b-2 border-[#e5e5e5] flex px-5 gap-10">
      {DETAIL_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="py-3 text-[14px] font-[Pretendard,sans-serif] transition-all duration-150 relative whitespace-nowrap"
            style={{
              color: isActive ? '#111' : '#aaa',
              fontWeight: isActive ? 700 : 400,
            }}
          >
            {tab.label}
            {isActive && <span className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#111]" />}
          </button>
        );
      })}
    </nav>
  );
}
