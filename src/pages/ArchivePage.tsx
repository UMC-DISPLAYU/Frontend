import { useState } from 'react';

// SVG Icon imports
import { ChevronRight } from 'lucide-react';

import BookmarkIcon from '../assets/Icon.svg';
import MemberIcon from '../assets/MemberIcon.svg';
import PencilIcon from '../assets/PencilIcon.svg';
import TrashIcon from '../assets/TrashIcon.svg';

/* ------------------------------------------------------------------ */
/* 타입 & 목데이터                                                       */
/* ------------------------------------------------------------------ */

type TabKey = 'exhibition' | 'artwork' | 'artist';

interface ExhibitionItem {
  id: string;
  status: string;
  title: string;
  org: string;
  period: string;
  place: string;
  thumbnail: string;
  memo?: string;
}

interface ArtworkItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  memo?: string;
}

interface ArtistItem {
  id: string;
  name: string;
  field: string;
  registeration: string;
  exhibition: string;
  thumbnail: string;
  memo?: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

const EXHIBITIONS: ExhibitionItem[] = [
  {
    id: '1',
    status: '전시 중',
    title: '형태의 침묵',
    org: '중앙대학교 디자인학부',
    period: '05.28 – 06.05',
    place: '중앙대학교 310관 갤러리',
    thumbnail: 'https://placehold.co/112x140',
    memo: '',
  },
  {
    id: '2',
    status: '전시 중',
    title: '형태의 침묵',
    org: '중앙대학교 디자인학부',
    period: '05.28 – 06.05',
    place: '중앙대학교 310관 갤러리',
    thumbnail: 'https://placehold.co/112x140',
    memo: '공간이 조용해서 작품의 재료감이 더 잘 보였다. 작품 설명보다 전시 동선...',
  },
  {
    id: '3',
    status: '전시 중',
    title: '감각의 표면',
    org: '홍익대학교 회화과',
    period: '06.23 – 06.27',
    place: '홍익대학교 현대미술관',
    thumbnail: 'https://placehold.co/112x140',
  },
];

const ARTWORKS: ArtworkItem[] = [
  {
    id: '1',
    title: 'FROM 2026',
    artist: '고상준',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    artist: '최유성',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '3',
    title: 'FROM 2026',
    artist: '고상준',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '4',
    title: 'VISUAL WAVE',
    artist: '최유성',
    thumbnail: 'https://placehold.co/112x140',
  },
];

const ARTISTS: ArtistItem[] = [
  {
    id: '1',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '2',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '3',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
];

/* ------------------------------------------------------------------ */
/* 헤더(타이틀) + 탭                                                     */
/* ------------------------------------------------------------------ */

function ArchiveHeader({
  activeTab,
  onTabChange,
  onOpenSettings,
}: {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="shrink-0 bg-white">
      <div className="px-5 pt-2 pb-5 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <h1 className="text-slate-900 text-3xl font-['Aldrich'] leading-10">Archive</h1>
          <p className="pt-1 text-neutral-500 text-xs font-normal font-['Pretendard'] leading-4">
            저장한 전시와 작품, 작가를 다시 꺼내보세요.
          </p>
        </div>
        <button
          type="button"
          aria-label="설정"
          onClick={onOpenSettings}
          className="shrink-0 p-1 text-neutral-700"
        >
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <nav className="px-5 border-b-2 border-zinc-300 flex items-center gap-24 shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`w- h-11 -mb-0.5 border-b-2 text-sm font-['Pretendard'] leading-5 ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-400 font-normal'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 전시 카드                                                            */
/* ------------------------------------------------------------------ */

function ExhibitionCard({ item }: { item: ExhibitionItem }) {
  const hasMemo = Boolean(item.memo);

  return (
    <article className="shrink-0 w-full bg-white rounded-2xl outline-1 -outline-offset-1 outline-zinc-100 flex flex-col overflow-hidden font-['Pretendard']">
      <div className="p-3.5 flex justify-start items-start gap-3.5">
        <div className="w-28 h-36 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
          <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
        </div>

        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <div className="self-stretch flex justify-between items-start gap-2">
            <div className="px-2 py-0.5 bg-indigo-500 rounded-lg shrink-0">
              <span className="text-neutral-50 text-[10px] font-normal font-['Pretendard'] leading-3">
                {item.status}
              </span>
            </div>
            <button type="button" aria-label="북마크" className="shrink-0">
              <img src={BookmarkIcon} alt="" className="size-5" />
            </button>
          </div>

          <div className="self-stretch pt-2">
            <div className="text-neutral-900 text-base font-bold leading-5 truncate">
              {item.title}
            </div>
          </div>
          <div className="self-stretch pt-1.5">
            <div className="text-neutral-700 text-xs font-normal leading-4 truncate">
              {item.org}
            </div>
          </div>
          <div className="pt-1.5">
            <div className="text-zinc-500 text-xs font-normal leading-4">{item.period}</div>
          </div>
          <div className="self-stretch pt-1.5">
            <div className="text-neutral-400 text-xs font-normal leading-4 truncate">
              {item.place}
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 py-2 bg-gray-200 flex flex-col justify-start items-start gap-1.5">
        <div className="self-stretch flex justify-between items-center">
          <div className="flex justify-start items-center gap-1.5">
            <img src={PencilIcon} alt="" className="size-2.5 shrink-0" />
            <span className="text-neutral-400 text-xs font-semibold font-['Pretendard'] leading-4">
              내 메모
            </span>
          </div>
          {hasMemo && (
            <button
              type="button"
              className="text-neutral-400 text-xs font-normal font-['Pretendard'] underline leading-4 shrink-0"
            >
              확인
            </button>
          )}
        </div>

        {hasMemo ? (
          <p className="self-stretch text-neutral-400 text-xs font-normal font-['Pretendard'] leading-4">
            {item.memo}
          </p>
        ) : (
          <button
            type="button"
            className="self-stretch text-left text-stone-300 text-xs font-normal font-['Pretendard'] underline leading-4"
          >
            메모 작성하기
          </button>
        )}
      </section>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 작품 카드 (2열 그리드)                                                */
/* ------------------------------------------------------------------ */

function ArtworkCard({ item }: { item: ArtworkItem }) {
  return (
    <article className="bg-[#FCFCFC] rounded-lg outline-1 -outline-offset-1 outline-[#E5E5E5] flex flex-col overflow-hidden font-['Pretendard']">
      {/* 카드 안쪽 패딩 6px, 썸네일 176px */}
      <div className="p-1.5 pb-0">
        <div className="relative rounded-lg overflow-hidden">
          <div className="w-full h-44 bg-zinc-100">
            <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
          </div>
          <button type="button" aria-label="북마크" className="absolute bottom-2 right-2">
            <img src={BookmarkIcon} alt="" className="size-5" />
          </button>
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-3 flex flex-col gap-1">
        <div className="text-neutral-900 text-sm font-bold font-['Pretendard'] leading-5 truncate">
          {item.title}
        </div>
        <div className="text-neutral-900 text-xs font-normal font-['Pretendard'] leading-4 truncate">
          {item.artist}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 작가 카드                                                           */
/* ------------------------------------------------------------------ */

function ArtistCard({ item }: { item: ArtistItem }) {
  return (
    <article className="w-full bg-[#FCFCFC] rounded-[20px] outline-1 -outline-offset-1 outline-[#D9D9D9] overflow-hidden font-['Pretendard']">
      <div className="flex items-center gap-3.5 px-3 py-3.5">
        <div className="size-12 rounded-full bg-[#E5E5E5] overflow-hidden shrink-0">
          <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.name} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-gray-900 text-sm font-bold font-['Pretendard'] leading-5 truncate">
            {item.name}
          </div>
          <div className="text-gray-500 text-xs font-normal font-['Pretendard'] leading-4 truncate">
            {item.field} · 등록 작품 수 {item.registeration} · (전시 수 {item.exhibition})
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="북마크">
            <img src={BookmarkIcon} alt="" className="size-5" />
          </button>
          <svg
            className="size-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 설정 바텀시트                                                         */
/* ------------------------------------------------------------------ */

interface SettingsMenu {
  key: string;
  icon: string;
  iconWrapClass: string;
  title: string;
  titleClass: string;
  description: string;
  descriptionClass: string;
}

const SETTINGS_MENUS: SettingsMenu[] = [
  {
    key: 'member',
    icon: MemberIcon,
    iconWrapClass: 'bg-[#f8fafb] border border-[#e9eced]',
    title: '멤버 관리',
    titleClass: 'text-[#202020]',
    description: '멤버 목록, 가입 신청, 강제 퇴장',
    descriptionClass: 'text-[#636970]',
  },
  {
    key: 'delete',
    icon: TrashIcon,
    iconWrapClass: 'bg-[#f03f40]/10',
    title: '동호회 삭제',
    titleClass: 'text-[#f03f40]',
    description: '삭제 후 복구가 불가능해요',
    descriptionClass: 'text-[#f03f40]/50',
  },
];

function SettingsSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (key: SettingsMenu['key']) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="w-full max-w-md relative">
        {/* 딤 배경 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* 바텀시트 */}
        <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[20px] pb-12 flex flex-col items-center font-['Pretendard']">
          {/* 핸들 */}
          <div className="w-full pt-6 pb-3 flex justify-center">
            <div className="w-11 h-1 rounded-full bg-[#dee3e5]" />
          </div>

          <ul className="w-full px-5">
            {SETTINGS_MENUS.map((menu, index) => (
              <li key={menu.key}>
                <button
                  type="button"
                  onClick={() => onSelect(menu.key)}
                  className={`w-full h-17 flex items-center gap-3 py-2 ${
                    index < SETTINGS_MENUS.length - 1 ? 'border-b border-[#e9eced]' : ''
                  }`}
                >
                  <span
                    className={`shrink-0 flex items-center justify-center p-3 rounded-xl ${menu.iconWrapClass}`}
                  >
                    <img src={menu.icon} alt="" className="size-7" />
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-1 items-start text-left">
                    <span
                      className={`text-lg font-semibold leading-tight truncate ${menu.titleClass}`}
                    >
                      {menu.title}
                    </span>
                    <span
                      className={`text-sm font-medium leading-5 truncate ${menu.descriptionClass}`}
                    >
                      {menu.description}
                    </span>
                  </span>
                  <ChevronRight color="#99A1AF" className="size-6 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 화면 전체 조립                                                        */
/* ------------------------------------------------------------------ */

export function ArchivePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectSetting = () => {
    // TODO: 각 메뉴(정보 수정/멤버 관리/삭제) 라우팅·동작 연결
    setIsSettingsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-white flex flex-col">
      <ArchiveHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5">
        {activeTab === 'exhibition' && (
          <div className="flex flex-col gap-3">
            {EXHIBITIONS.map((item) => (
              <ExhibitionCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'artwork' && (
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-3">
            {ARTWORKS.map((item) => (
              <ArtworkCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'artist' && (
          <div className="flex flex-col gap-3">
            {ARTISTS.map((item) => (
              <ArtistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSelect={handleSelectSetting}
      />
    </div>
  );
}
