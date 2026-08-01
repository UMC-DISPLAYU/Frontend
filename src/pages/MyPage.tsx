import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { MyPageHeader, SettingsSheet } from '@/components/mypage';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { TabKey } from '@/types/mypage';

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(true);

  const { data: userData, isLoading, error } = useUserProfile();

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

  const { isArtistVerified, profile } = userData;

  return (
    <div className="w-96 mx-auto h-dvh bg-gray-100 flex flex-col">
      <MyPageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMenu={() => setIsSettingsOpen(true)}
        onToggleView={handleToggleView}
        onVerifyArtist={() => {
          navigate('/artist-verification');
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
        <ErrorView
          fullScreen={false}
          message={`${activeTab === 'exhibition' ? '전시' : activeTab === 'artwork' ? '작품' : '작가'} 데이터가 없습니다.`}
        />
      </section>

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSelect={handleSelectSetting}
      />
    </div>
  );
}
