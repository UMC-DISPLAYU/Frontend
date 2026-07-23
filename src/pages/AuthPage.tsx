import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArtworkCard, ExhibitionCard, SettingsSheet } from '@/components/mypage';
import { AuthPageHeader } from '@/components/mypage/AuthPageHeader';
import { AUTH_PAGE_PROFILE } from '@/mocks/authPage';
import { ARTWORKS, EXHIBITIONS } from '@/mocks/mypage';
import type { TabKey } from '@/types/mypage';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex flex-col">
      <AuthPageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMenu={() => setIsSettingsOpen(true)}
        onRefresh={() => navigate('/my')}
        onRegister={() => {
          // TODO: 전시/작품 등록 플로우 연결
        }}
        onManage={() => {
          // TODO: 전시/작품 관리 플로우 연결
        }}
        onShare={() => {
          // TODO: 프로필 공유 동작 연결
        }}
        profile={AUTH_PAGE_PROFILE}
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {activeTab === 'exhibition' && (
          <div className="flex flex-col gap-3">
            {EXHIBITIONS.map((item) => (
              <ExhibitionCard key={item.id} item={item} isArtistView />
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
      </section>

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSelect={handleSelectSetting}
      />
    </div>
  );
}
