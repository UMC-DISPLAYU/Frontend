import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArtistCard,
  ArtworkCard,
  ExhibitionCard,
  MyPageHeader,
  SettingsSheet,
} from '@/components/mypage';
import { useArchivedArtists, useArchivedArtworks, useArchivedExhibitions } from '@/hooks/queries/useMyPage';
import { usePersonalArtworks } from '@/hooks/queries/usePersonalArtwork';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  MOCK_ARTWORK_FIXTURES,
  MOCK_DISPLAY_FIXTURES,
  MOCK_PROFILE_IMAGES,
} from '@/mocks/data';
import type { ArtistItem, ExhibitionItem, SavedArtworkItem, TabKey } from '@/types/mypage';

const mapArchivedExhibition = (
  item: NonNullable<ReturnType<typeof useArchivedExhibitions>['data']>['displays'][number],
): ExhibitionItem => {
  const display = item as typeof item & {
    title?: string;
    organization?: string;
    period?: string;
    placeName?: string;
    status?: string;
    posterImageUrl?: string;
  };

  return {
    id: String(display.displayId),
    status: display.status ?? '저장',
    title: display.title ?? `MOCK 저장 전시 ${display.displayId}`,
    org: display.organization ?? 'MOCK 기관',
    period: display.period ?? display.savedAt.slice(0, 10),
    place: display.placeName ?? 'MOCK 전시장',
    thumbnail: display.posterImageUrl ?? MOCK_DISPLAY_FIXTURES[0].posterImages[0].imageUrl,
    memo: display.memo ?? undefined,
  };
};

const mapArchivedArtwork = (
  item: NonNullable<ReturnType<typeof useArchivedArtworks>['data']>['works'][number],
): SavedArtworkItem => {
  const artwork = item as typeof item & {
    artworkName?: string;
    artistName?: string;
    artworkImageUrl?: string;
  };

  return {
    id: String(artwork.artworkId),
    title: artwork.artworkName ?? `MOCK 저장 작품 ${artwork.artworkId}`,
    artist: artwork.artistName ?? 'MOCK 작가',
    thumbnail: artwork.artworkImageUrl ?? MOCK_ARTWORK_FIXTURES[0].images[0].imageUrl,
    memo: artwork.memo ?? undefined,
  };
};

const mapArchivedArtist = (
  item: NonNullable<ReturnType<typeof useArchivedArtists>['data']>['artists'][number],
): ArtistItem => {
  const artist = item as typeof item & {
    artistName?: string;
    fields?: string[];
    artworkCount?: number;
    exhibitionCount?: number;
    profileImageUrl?: string;
  };

  return {
    id: String(artist.artistId),
    name: artist.artistName ?? `MOCK 작가 ${artist.artistId}`,
    field: artist.fields?.join(' · ') ?? 'MOCK 분야',
    registeration: String(artist.artworkCount ?? 0),
    exhibition: String(artist.exhibitionCount ?? 0),
    thumbnail: artist.profileImageUrl ?? MOCK_PROFILE_IMAGES[0].imageUrl,
  };
};

const mapPersonalArtwork = (
  item: NonNullable<ReturnType<typeof usePersonalArtworks>['data']>[number],
  artistName: string,
): SavedArtworkItem => ({
  id: String(item.personalArtworkId),
  title: item.artworkName,
  artist: artistName,
  thumbnail: item.thumbnailUrl,
});

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(true);

  const { data: userData, isLoading, error } = useUserProfile();
  const shouldLoadSavedExhibitions = !isArtistView && activeTab === 'exhibition';
  const shouldLoadSavedArtworks = !isArtistView && activeTab === 'artwork';
  const shouldLoadSavedArtists = !isArtistView && activeTab === 'artist';
  const shouldLoadMyArtworks = isArtistView && activeTab === 'artwork' && !!userData;
  const { data: archivedExhibitions, isLoading: isExhibitionsLoading } = useArchivedExhibitions({
    enabled: shouldLoadSavedExhibitions,
  });
  const { data: archivedArtworks, isLoading: isArtworksLoading } = useArchivedArtworks({
    enabled: shouldLoadSavedArtworks,
  });
  const { data: archivedArtists, isLoading: isArtistsLoading } = useArchivedArtists({
    enabled: shouldLoadSavedArtists,
  });
  const { data: personalArtworks, isLoading: isPersonalArtworksLoading } = usePersonalArtworks(
    { userId: userData?.userId ?? 0 },
    { enabled: shouldLoadMyArtworks },
  );

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

  const { isArtistVerified, profile } = userData;

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-gray-100 flex flex-col">
      <MyPageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMenu={() => setIsSettingsOpen(true)}
        onToggleView={handleToggleView}
        onVerifyArtist={() => {
          // TODO: 작가 인증 플로우 연결
        }}
        onRegister={() => {
          navigate('/exhibition-register');
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
            {isExhibitionsLoading && !isArtistView && (
              <p className="text-neutral-500 text-sm font-['Pretendard']">불러오는 중...</p>
            )}
            {(isArtistView ? [] : (archivedExhibitions?.displays.map(mapArchivedExhibition) ?? [])).map((item) => (
              <ExhibitionCard key={item.id} item={item} isArtistView={isArtistView} />
            ))}
          </div>
        )}

        {activeTab === 'artwork' && (
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-3">
            {isArtworksLoading && !isArtistView && (
              <p className="text-neutral-500 text-sm font-['Pretendard']">불러오는 중...</p>
            )}
            {isPersonalArtworksLoading && isArtistView && (
              <p className="text-neutral-500 text-sm font-['Pretendard']">불러오는 중...</p>
            )}
            {(isArtistView
              ? (personalArtworks?.map((item) => mapPersonalArtwork(item, profile.name.replace(/ 님$/, ''))) ?? [])
              : (archivedArtworks?.works.map(mapArchivedArtwork) ?? [])
            ).map((item) => (
              <ArtworkCard key={item.id} item={item} isArtistView={isArtistView} />
            ))}
          </div>
        )}

        {activeTab === 'artist' && !isArtistView && (
          <div className="flex flex-col gap-3">
            {isArtistsLoading && (
              <p className="text-neutral-500 text-sm font-['Pretendard']">불러오는 중...</p>
            )}
            {(archivedArtists?.artists.map(mapArchivedArtist) ?? []).map((item) => (
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
