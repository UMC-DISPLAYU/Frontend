import { ExternalLink, Menu, RefreshCcw, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <header className="shrink-0 bg-card">
      <div className="px-5 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <h1 className="typo-heading-3xl text-main">My Page</h1>
          {isArtistVerified && isArtistView && (
            <span className="inline-flex items-center px-2.5 py-1 bg-sky-100 rounded-sm">
              <span className="text-line-active typo-body-xs-regular">작가인증</span>
            </span>
          )}
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

      <div className="px-5 pt-5 pb-5 flex flex-col gap-3.5">
        <div className="flex gap-6 items-start">
          <img
            className="size-20 rounded-full object-cover shrink-0"
            src={profile.avatar || FALLBACK_PROFILE_IMAGE}
            alt={profile.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
            }}
          />
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="typo-body-xl-bold text-main truncate">{profile.name}</div>
            {isArtistView ? (
              <div className="flex items-center gap-5.5">
                <div className="w-17.5 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.schoolIcon} alt="" />
                  <span className="typo-body-xs-semibold text-main">{profile.school}</span>
                </div>
                <div className="w-18 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.fieldIcon} alt="" />
                  <span className="typo-body-xs-semibold text-main">{profile.field}</span>
                </div>
                <div className="w-17.5 flex flex-col items-center gap-0.5">
                  <img className="w-12 h-9 object-contain" src={profile.exhibitionIcon} alt="" />
                  <span className="typo-body-xs-semibold text-main">{profile.exhibit}</span>
                </div>
              </div>
            ) : (
              <div className="typo-body-xs-regular text-main truncate">
                {profile.caption || '내가 저장한 작품 확인하기'}
              </div>
            )}
          </div>
          {!isArtistVerified && !isArtistView && (
            <button
              type="button"
              onClick={onVerifyArtist}
              className="shrink-0 px-6 py-1.5 bg-box200 rounded-lg border border-line-soft self-center"
            >
              <span className="typo-body-xs-regular text-main underline">작가 인증하기</span>
            </button>
          )}
        </div>

        {isArtistView && profile.bio && (
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
        )}

        {isArtistView && (
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
              <Share className="size-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <nav className="border-b-2 border-line flex shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
        {TABS.map((tab) => {
          if (isArtistView && tab.key === 'artist') return null;

          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex-1 h-11 flex justify-center pt-3',
                isActive ? 'typo-body-sm-bold text-main' : 'typo-body-sm-regular text-faint',
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute w-35 h-0.5 bg-main bottom-0 left-1/2 -translate-x-1/2" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
