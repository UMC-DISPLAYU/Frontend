import { Bookmark, ChevronLeft, ExternalLink, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { MYPAGE_TABS } from '@/constants/mypage';
import type { ArtistProfile, TabKey } from '@/types/mypage';

interface AuthPageHeaderProps {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  onOpenMenu: () => void;
  onRefresh: () => void;
  onRegister: () => void;
  onManage: () => void;
  onShare: () => void;
  profile: ArtistProfile;
}

export function AuthPageHeader({
  activeTab,
  onTabChange,
  onRegister,
  onManage,
  onShare,
  profile,
}: AuthPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="shrink-0 bg-white">
      <div className="px-5 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-neutral-900 text-xl font-bold font-['Pretendard'] leading-10">
            작가 정보
          </h1>
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
            <div className="flex items-center gap-5.5 justify-between">
              <div className="w-18 flex flex-col items-center gap-0.5">
                <img className="w-12 h-9 object-contain" src={profile.schoolIcon} alt="" />
                <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
                  {profile.school}
                </span>
              </div>
              <div className="w-18 flex flex-col items-center gap-0.5">
                <img className="w-12 h-9 object-contain" src={profile.fieldIcon} alt="" />
                <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
                  {profile.field}
                </span>
              </div>
              <div className="w-18 flex flex-col items-center gap-0.5">
                <img className="w-12 h-9 object-contain" src={profile.exhibitionIcon} alt="" />
                <span className="text-neutral-900 text-xs font-semibold font-['Pretendard'] leading-4">
                  {profile.exhibit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-neutral-800 text-xs font-semibold font-['Pretendard'] leading-4">
            {profile.bio}
          </p>
          <a
            href={`https://${profile.portfolioUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 text-xs font-medium font-['Pretendard'] leading-5"
          >
            <ExternalLink className="size-4" />
            {profile.portfolioUrl}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRegister}
            className="flex-1 h-11 bg-gray-200 rounded-xl flex justify-center items-center gap-1.5"
          >
            <Bookmark className="size-5" />
            <span className="text-neutral-900 text-sm font-normal font-['Pretendard'] leading-5">
              작가 저장
            </span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex-1 h-11 bg-neutral-800 rounded-xl flex justify-center items-center gap-1.5"
          >
            <span className="text-white text-sm font-normal font-['Pretendard'] leading-5">
              프로필 공유
            </span>
            <Upload color="#ffffff" className="size-5" />
          </button>
        </div>
      </div>

      <nav className="border-b-2 border-zinc-300 flex shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
        {MYPAGE_TABS.filter((tab) => tab.key !== 'artist').map((tab) => {
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
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-45 h-0.5 bg-neutral-900" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
