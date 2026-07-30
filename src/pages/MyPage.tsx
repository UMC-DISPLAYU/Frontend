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

export function MyPage() {
  const { activeTab, isSettingsOpen, isArtistView, setIsSettingsOpen, toggleArtistView } =
    useMyPageStore();

  const { data: userData, isLoading, error } = useUserProfile();

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-neutral-500 text-sm font-['Pretendard']">로딩 중...</div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-sm font-['Pretendard']">
          프로필을 불러오는데 실패했습니다.
        </div>
      </div>
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
    <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex flex-col">
      <MyPageHeader
        onVerifyArtist={() => {
          // TODO: 작가 인증 플로우 연결
          // 1. 학교 이메일 인증이 안된 경우 → 이메일 인증 페이지로 이동
          // 2. 이메일 인증이 된 경우 → 작가 프로필 설정 페이지(/edit-artist-profile)로 이동
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

      <SettingsSheet onSelect={handleSelectSetting} />
    </div>
  );
}
