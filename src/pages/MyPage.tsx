import { useEffect, useState } from 'react';

// SVG Icon imports
import {Bookmark, ChevronRight, ExternalLink,Menu, Pencil, RefreshCcw, Upload} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useHeaderContext } from '../components/layout/headerContext';
import { UserProfile,useUserProfile } from '../hooks/useUserProfile';

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
    status: '전시종료',
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
/* 상태 뱃지 색상 헬퍼                                                   */
/* ------------------------------------------------------------------ */

function statusBadgeClass(status: string) {
  // 진행 중 계열은 파랑, 그 외(전시종료 등)는 회색
  return status.includes('종료') ? 'bg-neutral-400' : 'bg-sky-600';
}

/* ------------------------------------------------------------------ */
/* 헤더(타이틀 + 프로필) + 탭                                            */
/* ------------------------------------------------------------------ */

function MyPageHeader({
  activeTab,
  onTabChange,
  onOpenMenu,
  onToggleView,
  onVerifyArtist,
  onRegister,
  onManage,
  onShare,
  profile,
  isArtistVerified,
  isArtistView,
}: {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  onOpenMenu: () => void;
  onToggleView: () => void;
  onVerifyArtist?: () => void;
  onRegister?: () => void;
  onManage?: () => void;
  onShare?: () => void;
  profile: UserProfile;
  isArtistVerified: boolean;
  isArtistView: boolean;
}) {
  return (
    <header className="shrink-0 bg-white">
      {/* 타이틀 + 작가인증 뱃지 + 우측 아이콘 */}
      <div className="px-5 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <h1 className="text-slate-900 text-3xl font-normal font-['Aldrich'] leading-10">
            My Page
          </h1>
          {isArtistVerified && isArtistView && (
            <span className="px-1.5 py-0.5 bg-blue-100 rounded-sm">
              <span className="text-blue-600 text-[10px] font-normal font-['Pretendard'] leading-3">
                작가인증
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3.5 text-neutral-900">
          <button type="button" aria-label="전환" onClick={onToggleView}>
            <RefreshCcw className="size-5" />
          </button>
          <button type="button" aria-label="메뉴" onClick={onOpenMenu}>
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* 프로필 */}
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3.5">
        {/* 아바타 + 이름 + 학교/분야 또는 캡션 */}
        <div className="flex items-center gap-6">
          <img
            className="size-20 rounded-full border-[2.67px] border-stone-300 object-cover shrink-0"
            src={profile.avatar}
            alt={profile.name}
          />
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="text-neutral-900 text-xl font-bold font-['Pretendard'] leading-7 truncate">
              {profile.name}
            </div>
            {isArtistView ? (
              <div className="flex items-center gap-5.5">
                <div className="w-17.5 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.schoolIcon} alt="" />
                  <span className="text-neutral-500 text-xs font-normal font-['Pretendard'] leading-4">
                    {profile.school}
                  </span>
                </div>
                <div className="w-18 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.fieldIcon} alt="" />
                  <span className="text-neutral-500 text-xs font-normal font-['Pretendard'] leading-4">
                    {profile.field}
                  </span>
                </div>
                <div className="w-17.5 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.exhibitionIcon} alt="" />
                  <span className="text-neutral-500 text-xs font-normal font-['Pretendard'] leading-4">
                    {profile.exhibit}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-950 text-xs font-normal font-['Pretendard'] leading-4 truncate">
                {profile.caption || '내가 저장한 작품 확인하기'}
              </div>
            )}
          </div>
          {!isArtistVerified && !isArtistView && (
            <button
              type="button"
              onClick={onVerifyArtist}
              className="shrink-0 px-6 py-1.5 bg-gray-300 rounded-lg outline outline-1 -outline-offset-1 outline-gray-200"
            >
              <span className="text-neutral-900 text-xs font-normal font-['Pretendard'] underline leading-4">
                작가 인증하기
              </span>
            </button>
          )}
        </div>

        {/* 소개 + 포트폴리오 링크 (작가 뷰일 경우만) */}
        {isArtistView && profile.bio && (
          <div className="flex flex-col gap-2">
            <p className="text-neutral-800 text-xs font-semibold font-['Pretendard'] leading-4">
              {profile.bio}
            </p>
            {profile.portfolioUrl && (
              <a
                href={`https://${profile.portfolioUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-600 text-xs font-medium font-['Pretendard'] leading-5"
              >
                <ExternalLink className="size-4" />
                {profile.portfolioUrl}
              </a>
            )}
          </div>
        )}

        {/* 액션 버튼 (작가 뷰일 경우만) */}
        {isArtistView && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRegister}
              className="flex-1 h-11 bg-gray-300 rounded-xl flex justify-center items-center"
            >
              <span className="text-neutral-900 text-sm font-normal font-['Pretendard'] leading-5">
                전시/작품등록
              </span>
            </button>
            <button
              type="button"
              onClick={onManage}
              className="flex-1 h-11 bg-gray-300 rounded-xl flex justify-center items-center"
            >
              <span className="text-neutral-900 text-sm font-normal font-['Pretendard'] leading-5">
                전시/작품관리
              </span>
            </button>
            <button
              type="button"
              aria-label="공유"
              onClick={onShare}
              className="size-11 shrink-0 bg-neutral-800 rounded-xl flex justify-center items-center"
            >
              <Upload color="#ffffff" className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* 탭 */}
      <nav className="border-b-2 border-zinc-300 flex shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
        {TABS.map((tab) => {
          // 작가 뷰일 경우 '작가' 탭 숨김
          if (isArtistView && tab.key === 'artist') return null;

          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex-1 h-11 flex justify-center pt-3 text-sm font-['Pretendard'] leading-5 ${
                isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400 font-normal'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-neutral-900" />
              )}
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

function ExhibitionCard({ item, isArtistView }: { item: ExhibitionItem; isArtistView: boolean }) {
  const hasMemo = Boolean(item.memo);

  return (
    <article className="shrink-0 w-full bg-neutral-50 rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] outline outline-1 -outline-offset-1 outline-neutral-400 flex flex-col overflow-hidden font-['Pretendard']">
      <div className="px-4 py-3.5 flex justify-start items-start gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-neutral-200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
          <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
        </div>

        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <div className="self-stretch flex justify-between items-start gap-2">
            <div className={`px-2 py-0.5 rounded-sm shrink-0 ${statusBadgeClass(item.status)}`}>
              <span className="text-neutral-50 text-[10px] font-normal leading-3">
                {item.status}
              </span>
            </div>
            <button type="button" aria-label="북마크" className="shrink-0">
              <Bookmark fill="#D70004" color={isArtistView ? "#D70004" : "#D70004"} className={isArtistView ? 'size-4' : 'size-4'} />
            </button>
          </div>

          <div className="self-stretch pt-2.5">
            <div className="text-neutral-900 text-base font-bold leading-6 truncate">
              {item.title}
            </div>
          </div>
          <div className="self-stretch pt-2.5">
            <div className="text-neutral-800 text-xs font-normal leading-4 truncate">
              {item.org}
            </div>
            <div className="text-neutral-500 text-xs font-normal leading-4">{item.period}</div>
          </div>
          <div className="self-stretch pt-4">
            <div className="text-neutral-400 text-[10px] font-normal leading-3 truncate">
              {item.place}
            </div>
          </div>
        </div>
      </div>

      <footer className="px-4 py-2 bg-gray-200 flex flex-col justify-start items-start gap-1.5">
        <div className="self-stretch flex justify-between items-center">
          <div className="flex justify-start items-center gap-1.5">
            <Pencil color="#99A1AF" className="size-2.5 shrink-0" />
            <span className="text-neutral-400 text-xs font-semibold leading-4">내 메모</span>
          </div>
          {hasMemo && (
            <button
              type="button"
              className="text-neutral-400 text-xs font-normal underline leading-4 shrink-0"
            >
              확인
            </button>
          )}
        </div>

        {hasMemo ? (
          <p className="self-stretch text-neutral-400 text-xs font-normal leading-4 line-clamp-2">
            {item.memo}
          </p>
        ) : (
          <button
            type="button"
            className="self-stretch text-left text-stone-300 text-xs font-normal underline leading-4"
          >
            메모 작성하기
          </button>
        )}
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 작품 카드 (2열 그리드)                                                */
/* ------------------------------------------------------------------ */

function ArtworkCard({ item }: { item: ArtworkItem }) {
  return (
    <article className="bg-neutral-50 rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] outline outline-1 -outline-offset-1 outline-neutral-400 flex flex-col overflow-hidden font-['Pretendard']">
      <div className="p-1.5 pb-0">
        <div className="relative rounded-xl overflow-hidden">
          <div className="w-full h-44 bg-neutral-200">
            <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
          </div>
          <button type="button" aria-label="북마크" className="absolute bottom-2 right-2">
            <Bookmark color= "#D70004" fill = "#D70004" className="size-4-10" />
          </button>
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-3 flex flex-col gap-1">
        <div className="text-neutral-900 text-sm font-bold leading-5 truncate">{item.title}</div>
        <div className="text-neutral-900 text-xs font-normal leading-4 truncate">{item.artist}</div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 작가 카드                                                           */
/* ------------------------------------------------------------------ */

function ArtistCard({ item }: { item: ArtistItem }) {
  return (
    <article className="w-full bg-neutral-50 rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] outline outline-1 -outline-offset-1 outline-neutral-400 overflow-hidden font-['Pretendard']">
      <div className="flex items-center gap-3.5 px-3 py-3.5">
        <div className="size-12 rounded-full bg-neutral-200 overflow-hidden shrink-0">
          <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.name} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-gray-900 text-sm font-bold leading-5 truncate">{item.name}</div>
          <div className="text-gray-500 text-xs font-normal leading-4 truncate">
            {item.field} · 등록 작품 수 {item.registeration} · (전시 수 {item.exhibition})
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="북마크">
            <Bookmark color="#D70004" fill="#D70004" className="size-4" />
          </button>
          <ChevronRight color="#99A1AF" className="size-4" />
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

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 화면 전체 조립                                                        */
/* ------------------------------------------------------------------ */

export function MyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(true); // 뷰 모드 상태 (작가 뷰 / 일반 뷰)
  const navigate = useNavigate();

  const { setHeader, resetHeader } = useHeaderContext();
  const { data: userData, isLoading, error } = useUserProfile();

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSetting = (_key: string) => {
    setIsSettingsOpen(false);
  };

  const handleToggleView = () => {
    setIsArtistView((prev) => !prev);
    // 작가 탭에 있을 때 일반 뷰로 전환하면 전시 탭으로 이동
    if (isArtistView && activeTab === 'artist') {
      setActiveTab('exhibition');
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-neutral-500 text-sm font-['Pretendard']">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error || !userData) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-sm font-['Pretendard']">
          프로필을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  const { isArtistVerified, profile } = userData;

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex flex-col">
      <MyPageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMenu={() => setIsSettingsOpen(true)}
        onToggleView={handleToggleView}
        onVerifyArtist={() => {
          // TODO: 작가 인증 플로우 연결
        }}
        onRegister={() => {
          // TODO: 전시/작품 등록 플로우 연결
        }}
        onManage={() => {
          // TODO: 전시/작품 관리 플로우 연결
        }}
        onShare={() => {
          // TODO: 프로필 공유 동작 연결
        }}
        profile={profile}
        isArtistVerified={isArtistVerified}
        isArtistView={isArtistView}
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {activeTab === 'exhibition' && (
          <div className="flex flex-col gap-3">
            {EXHIBITIONS.map((item) => (
              <ExhibitionCard key={item.id} item={item} isArtistView={isArtistView} />
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

        {activeTab === 'artist' && !isArtistView && (
          <div className="flex flex-col gap-3">
            {ARTISTS.map((item) => (
              <ArtistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSelect={handleSelectSetting}
      />
    </div>
  );
}
