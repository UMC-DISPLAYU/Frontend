import { Bookmark, ChevronLeft, ExternalLink, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import type { ArtistProfile, TabKey } from '@/types/mypage';
import { cn } from '@/utils/cn';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

interface AuthPageHeaderProps {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  onRegister: () => void;
  onShare: () => void;
  profile: ArtistProfile;
  isSaved?: boolean;
}

export function AuthPageHeader({
  activeTab,
  onTabChange,
  onRegister,
  onShare,
  profile,
  isSaved = false,
}: AuthPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="shrink-0 bg-card">
      <div className="px-5 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="size-7 text-main" strokeWidth={2} />
          </button>
          <h1 className="typo-body-xl-bold text-main">작가 프로필</h1>
        </div>
      </div>

      <div className="px-5 pt-5 pb-5 flex flex-col gap-3.5">
        <div className="flex items-center">
          <img
            className="size-20 rounded-full border-[2.67px] border-line object-cover shrink-0"
            src={profile.avatar || FALLBACK_PROFILE_IMAGE}
            alt={profile.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
            }}
          />
          <div className="flex-1 min-w-0 px-4 flex flex-col gap-1.5">
            <span className="w-fit inline-flex items-center px-1.5 py-0.5 bg-sky-100 rounded-full">
              <span className="text-line-active typo-body-xxs-regular uppercase">작가 프로필</span>
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="typo-body-xl-bold text-main truncate">{profile.name}</div>
                  <div className="typo-body-xs-regular text-hint truncate">{profile.school}</div>
                </div>

                <div className="flex items-center shrink-0">
                  <div className="w-11 flex flex-col items-center">
                    <span className="typo-body-xl-bold text-main">{profile.exhibitionCount}</span>
                    <span className="typo-body-xs-regular text-faint">전시</span>
                  </div>
                  <div className="w-px h-7 bg-line" />
                  <div className="w-11 flex flex-col items-center">
                    <span className="typo-body-xl-bold text-main">{profile.artworkCount}</span>
                    <span className="typo-body-xs-regular text-faint">작품</span>
                  </div>
                </div>
              </div>

              {profile.fields.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {profile.fields.map((field) => (
                    <span
                      key={field}
                      className="px-1.5 rounded-sm border border-line typo-body-xxs-regular text-hint"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="typo-body-xs-semibold text-sub700">{profile.bio}</p>
          {profile.portfolioUrl && (
            <a
              href={`https://${profile.portfolioUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 typo-body-xs-semibold text-link"
            >
              <ExternalLink className="size-4" />
              {profile.portfolioUrl}
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRegister}
            className="flex-1 h-11 bg-bt-gray rounded-xl flex justify-center items-center gap-1.5"
          >
            <Bookmark
              className={cn('size-4 text-main', isSaved && 'fill-bookmark text-bookmark')}
              strokeWidth={1.5}
            />
            <span className="typo-body-sm-regular text-main">작가 저장</span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex-1 h-11 bg-dark rounded-xl flex justify-center items-center gap-1.5"
          >
            <span className="typo-body-sm-regular text-white">프로필 공유</span>
            <Upload className="size-5 text-white" />
          </button>
        </div>
      </div>

      <nav className="border-b-2 border-line flex">
        {TABS.filter((tab) => tab.key !== 'artist').map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative flex-1 h-11 flex justify-center pt-3',
                isActive ? 'typo-body-sm-bold text-main' : 'typo-body-sm-regular text-faint',
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-45.25 h-0.5 bg-main" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
