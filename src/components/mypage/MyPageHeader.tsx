import { ExternalLink, Menu, RefreshCcw, Upload } from 'lucide-react';

import { TABS } from '@/constants/mypage';
import type { UserProfile } from '@/hooks/useUserProfile';
import type { TabKey } from '@/types/mypage';

interface MyPageHeaderProps {
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
}

export function MyPageHeader({
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
}: MyPageHeaderProps) {
  return (
    <header className="shrink-0 bg-white">
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

      <div className="px-5 pt-5 pb-5 flex flex-col gap-3.5">
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
                  <img
                    className="w-12 h-9 object-contain"
                    src={profile.schoolIcon}
                    alt=""
                  />
                  <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
                    {profile.school}
                  </span>
                </div>
                <div className="w-18 flex flex-col items-center gap-0.5">
                  <img
                    className="w-12 h-9 object-contain"
                    src={profile.fieldIcon}
                    alt=""
                  />
                  <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
                    {profile.field}
                  </span>
                </div>
                <div className="w-17.5 flex flex-col items-center gap-0.5">
                  <img
                    className="w-12 h-9 object-contain"
                    src={profile.exhibitionIcon}
                    alt=""
                  />
                  <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
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

      <nav className="border-b-2 border-zinc-300 flex shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
        {TABS.map((tab) => {
          if (isArtistView && tab.key === 'artist') return null;

          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex-1 h-11 flex justify-center pt-3 text-sm font-['Pretendard'] leading-5 ${
                isActive
                  ? 'text-neutral-900 font-bold'
                  : 'text-neutral-400 font-normal'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute w-35 h-0.5 bg-neutral-900 bottom-0 left-1/2 -translate-x-1/2" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
