import { ExternalLink, Menu, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Share from '@/assets/mypage/share.svg';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { useArtistPolicy, usePersonalArtworkPolicy } from '@/hooks/usePolicy';
import type { UserProfile } from '@/hooks/useUserProfile';
import { useMyPageStore } from '@/stores/useMyPageStore';
import type { TabKey } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

interface MyPageHeaderProps {
  onVerifyArtist?: () => void;
  onShare?: () => void;
  onToggleView?: () => void;
  profile: UserProfile;
  isArtistVerified: boolean;
}

export function MyPageHeader({
  onVerifyArtist,
  onShare,
  onToggleView,
  profile,
  isArtistVerified,
}: MyPageHeaderProps) {
  const navigate = useNavigate();
  const { activeTab, isArtistView, setActiveTab } = useMyPageStore();
  const artistPolicy = useArtistPolicy();
  const personalArtworkPolicy = usePersonalArtworkPolicy();
  const canViewArtist = hasPermission(artistPolicy, 'view');
  const canCreatePersonalArtwork = hasPermission(personalArtworkPolicy, 'create');

  return (
    <header className="shrink-0 bg-page">
      <div className="px-5 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <h1 className="typo-heading-3xl text-main">My Page</h1>
        </div>
        <div className="flex items-center gap-3.5 text-main">
          {canViewArtist && (
            <button type="button" aria-label="전환" onClick={onToggleView}>
              <RefreshCcw className="size-5" />
            </button>
          )}
          <button type="button" aria-label="메뉴" onClick={() => navigate('/setting/')}>
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {isArtistView ? (
        <div className="px-5 pt-5 pb-2.75 flex flex-col gap-3.5">
          <div className="flex items-center">
            <img
              className="size-22 rounded-full border-[2.67px] border-line object-cover shrink-0"
              src={profile.avatar || FALLBACK_PROFILE_IMAGE}
              alt={profile.name}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
              }}
            />
          <div>
            <span className="w-fit inline-flex items-center ml-2.5 px-1.5 py-0.5 bg-[#DBEAFE] rounded-full">
              <span className="text-line-active typo-body-xxs-regular uppercase">
                작가 프로필
              </span>
             </span>

            <div className="flex-1 min-w-0 px-4 flex flex-col gap-1.5">

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  <div className="flex-1 w-42 flex flex-col">
                    <div className="typo-body-xl-bold text-main truncate">{profile.name}</div>
                    <div className="typo-body-xs-regular text-hint truncate">{profile.school}</div>
                  </div>

                  <div className="flex items-center shrink-0">
                    <div className="w-11.5 flex flex-col items-center">
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

                {profile.fields && profile.fields.length > 0 && (
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
        </div>

          {(profile.bio || profile.portfolioUrl) && (
            <div className="flex flex-col gap-2">
              {profile.bio && <p className="typo-body-xs-regular text-sub700">{profile.bio}</p>}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 typo-body-xs-regular text-[#2563EB]"
                >
                  <ExternalLink className="size-4" />
                  {profile.portfolioUrl}
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/exhibition/register')}
              className="flex-1 h-11 bg-box200 rounded-xl flex justify-center items-center"
            >
              <span className="typo-body-sm-regular text-main">전시등록</span>
            </button>
            {canCreatePersonalArtwork && (
              <button
                type="button"
                onClick={() => navigate('/personal-artworks/register')}
                className="flex-1 h-11 bg-box200 rounded-xl flex justify-center items-center"
              >
                <span className="typo-body-sm-regular text-main">작품등록</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/my/exhibitions')}
              className="flex-1 h-11 bg-box200 rounded-xl flex justify-center items-center"
            >
              <span className="typo-body-sm-regular text-main">전시관리</span>
            </button>
            <button
              type="button"
              aria-label="공유"
              onClick={onShare}
              className="size-11 shrink-0 bg-dark rounded-xl flex justify-center items-center"
            >
              <img src={Share} alt="" className="size-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <img
              className="size-22 rounded-full border-[2.67px] border-line object-cover shrink-0"
              src={profile.avatar || FALLBACK_PROFILE_IMAGE}
              alt={profile.name}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
              }}
            />
            <div className="flex-1 min-w-0 flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="typo-body-xl-bold text-main truncate">{profile.name}</div>
                <div className="typo-body-xs-regular text-main truncate">
                  {profile.caption || '내가 저장한 작품 확인하기'}
                </div>
              </div>
              {!isArtistVerified && (
                <button
                  type="button"
                  onClick={onVerifyArtist}
                  className="shrink-0 inline-flex items-center justify-center px-6 py-1.5 bg-box rounded-lg border border-bt-border cursor-pointer"
                >
                  <span className="typo-body-xs-regular text-main underline">작가 인증하기</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="bg-page border-b border-line flex px-5">
        {TABS.map((tab) => {
          if (isArtistView && tab.key === 'artist') return null;

          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex-1 py-3 flex justify-center items-center',
                isActive ? 'typo-body-sm-bold text-main' : 'typo-body-sm-regular text-faint',
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-main z-10" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
