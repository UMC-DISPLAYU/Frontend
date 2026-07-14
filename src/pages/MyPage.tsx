import { useEffect, useState } from 'react';

import { useHeaderContext } from '@/components/layout/headerContext';
import {
  ArtistCard,
  ArtworkCard,
  ExhibitionCard,
  MyPageHeader,
  SettingsSheet,
} from '@/components/mypage';
import { ARTISTS, ARTWORKS, EXHIBITIONS } from '@/constants/mypage';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { TabKey } from '@/types/mypage';

export function MyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(true);

  const { setHeader, resetHeader } = useHeaderContext();
  const { data: userData, isLoading, error } = useUserProfile();

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  const handleToggleView = () => {
    setIsArtistView((prev) => !prev);
    if (isArtistView && activeTab === 'artist') {
      setActiveTab('exhibition');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-neutral-500 typo-body-md-bold">
          로딩 중...
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 typo-body-md-semibold">
          프로필을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  const { isArtistVerified, profile } = userData;

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-box flex flex-col">
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
              <ExhibitionCard
                key={item.id}
                item={item}
                isArtistView={isArtistView}
              />
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
