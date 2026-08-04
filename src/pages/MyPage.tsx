import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import {
  ArtistCard,
  ArtworkCard,
  ExhibitionCard,
  MyPageHeader,
  SettingsSheet,
} from '@/components/mypage';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  ARTISTS,
  MY_BOOKMARKED_ARTWORKS,
  MY_BOOKMARKED_EXHIBITIONS,
  MY_PARTICIPATED_EXHIBITIONS,
  MY_REGISTERED_ARTWORKS,
} from '@/mocks/mypage';
import { useMyPageStore } from '@/stores/useMyPageStore';

type TabKey = 'exhibition' | 'artwork' | 'artist';

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(true);

  const { data: userData, isLoading, error } = useUserProfile();

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  if (isLoading) {
    return <LoadingView message="프로필 로딩 중..." />;
  }

  if (error || !userData) {
    return (
      <ErrorView
        message={error?.message || '프로필 정보를 불러오지 못했습니다.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { id, isArtistVerified, profile } = userData;

  const handleShare = async () => {
    const url = `${window.location.origin}/artist/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} 작가님`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다');
      }
    } catch (err) {
      // 사용자가 공유를 취소한 경우 등
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <MyPageHeader
        onVerifyArtist={() => {
          navigate('/artist-verification');
        }}
        onShare={handleShare}
        profile={profile}
        isArtistVerified={isArtistVerified}
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {activeTab === 'exhibition' && (
          <div className="flex flex-col gap-3">
            {(isArtistView ? MY_PARTICIPATED_EXHIBITIONS : MY_BOOKMARKED_EXHIBITIONS).map(
              (item) => (
                <ExhibitionCard key={item.id} item={item} isArtistView={isArtistView} />
              ),
            )}
          </div>
        )}

        {activeTab === 'artwork' && (
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-3">
            {(isArtistView ? MY_REGISTERED_ARTWORKS : MY_BOOKMARKED_ARTWORKS).map((item) => (
              <ArtworkCard key={item.id} item={item} isArtistView={isArtistView} />
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
