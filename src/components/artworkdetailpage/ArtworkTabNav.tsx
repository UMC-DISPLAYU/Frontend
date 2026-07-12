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
    <nav className="bg-[#F0F0F3] sticky top-0 z-10 border-b-2 border-[#e5e5e5] flex px-5 gap-19">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            id={`artwork-tab-${tab.key}`}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="py-3 text-[14px] font-[Pretendard,sans-serif] transition-all duration-150 relative whitespace-nowrap"
            style={{
              color: isActive ? '#111' : '#aaa',
              fontWeight: isActive ? 700 : 400,
            }}
          >
            {tab.label}
            {isActive && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#111]" />}
          </button>
        );
      })}
    </nav>
  );
}
