import { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView, LoginConfirmModal } from '@/components/common';
import { ArtworkCard, AuthPageHeader, ExhibitionCard } from '@/components/mypage';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';
import {
  useArchiveArtist,
  useArchivedArtists,
  useUnarchiveArtist,
} from '@/hooks/queries/useArchive';
import { useArtistExhibitionArtworks, useUserArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useArtistDisplays } from '@/hooks/queries/useMyDisplays';
import { useUserArtistProfile } from '@/hooks/queries/useUserProfile';
import { useShare } from '@/hooks/useShare';
import { useAuthStore } from '@/stores/authStore';
import type { ArtistProfile, SavedArtworkItem, TabKey } from '@/types/mypage';

const formatCount = (count: number | undefined) => String(count ?? 0).padStart(2, '0');

export function AuthPage() {
  const navigate = useNavigate();
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);

  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { handleShare } = useShare();

  const artistProfileQuery = useUserArtistProfile(userId);
  /* 작품 탭 진입 전에도 헤더의 작품 수를 보여줘야 해서 탭과 무관하게 항상 불러옵니다. */
  const personalArtworksQuery = useUserArtworks(userId);
  const exhibitionArtworksQuery = useArtistExhibitionArtworks(userId);
  const exhibitionsQuery = useArtistDisplays(userId);
  const {
    data: archivedArtists,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useArchivedArtists();
  const archiveArtist = useArchiveArtist();
  const unarchiveArtist = useUnarchiveArtist();

  /* 저장 여부를 정확히 판단하기 위해 페이지가 남아있으면 계속 불러옵니다. */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const archivedArtistMatch = (archivedArtists?.pages.flatMap((page) => page.artists) ?? []).find(
    (artist) => artist.artistUserId === userId,
  );
  const isSaved = Boolean(archivedArtistMatch);
  const isSavePending = archiveArtist.isPending || unarchiveArtist.isPending;

  const personalArtworks = personalArtworksQuery.data ?? [];
  const exhibitionArtworks = exhibitionArtworksQuery.data?.artworks ?? [];

  const profile = useMemo<ArtistProfile>(() => {
    const data = artistProfileQuery.data;
    return {
      name: data?.artistName || '작가',
      isVerified: true,
      avatar: data?.profileImageUrl || FALLBACK_PROFILE_IMAGE,
      school: data?.schoolName || '',
      fields: data?.fields?.map((code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code) ?? [],
      exhibitionCount: formatCount(exhibitionsQuery.data?.length),
      /* 개인 작품 + 전시 내 작품을 실제로 합산한 값입니다. */
      artworkCount: formatCount(personalArtworks.length + exhibitionArtworks.length),
      bio: data?.introduction ?? '',
      portfolioUrl: data?.portfolioUrl || data?.externalLink || '',
    };
  }, [
    artistProfileQuery.data,
    exhibitionsQuery.data?.length,
    personalArtworks.length,
    exhibitionArtworks.length,
  ]);

  const artworks = useMemo<SavedArtworkItem[]>(() => {
    const personalItems: SavedArtworkItem[] = personalArtworks.map((item) => ({
      id: `personal-${item.personalArtworkId}`,
      personalArtworkId: item.personalArtworkId,
      title: item.artworkName,
      artist: profile.name,
      thumbnail: item.thumbnailUrl ?? '',
    }));
    const exhibitionItems: SavedArtworkItem[] = exhibitionArtworks.map((item) => ({
      id: `exhibit-${item.artworkId}`,
      artworkId: item.artworkId,
      title: item.artworkName,
      artist: item.artistName || profile.name,
      thumbnail: item.artworkImageUrl ?? '',
    }));
    return [...personalItems, ...exhibitionItems];
  }, [personalArtworks, exhibitionArtworks, profile.name]);

  const handleToggleSave = () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isSavePending || !Number.isFinite(userId)) return;

    if (isSaved) unarchiveArtist.mutate(userId);
    else archiveArtist.mutate(userId);
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/auth/${userId}`;
    await handleShare(url, `${profile.name} 작가님`);
  };

  if (artistProfileQuery.isLoading) {
    return <LoadingView message="작가 정보를 불러오는 중..." />;
  }

  if (artistProfileQuery.error || !artistProfileQuery.data) {
    return (
      <ErrorView
        message="작가 정보를 불러올 데이터가 없습니다."
        onRetry={() => artistProfileQuery.refetch()}
      />
    );
  }

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <LoginConfirmModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectPath={`/auth/${userId}`}
      />

      <AuthPageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRegister={handleToggleSave}
        onShare={handleShareProfile}
        profile={profile}
        isSaved={isSaved}
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {activeTab === 'exhibition' ? (
          exhibitionsQuery.isLoading ? (
            <LoadingView fullScreen={false} message="전시 로딩 중..." />
          ) : exhibitionsQuery.error ? (
            <ErrorView
              fullScreen={false}
              message="전시 정보를 불러오지 못했습니다."
              onRetry={() => exhibitionsQuery.refetch()}
            />
          ) : (exhibitionsQuery.data ?? []).length > 0 ? (
            <div className="flex flex-col gap-4">
              {(exhibitionsQuery.data ?? []).map((item) => (
                <ExhibitionCard key={item.id} item={item} isArtistView />
              ))}
            </div>
          ) : (
            <ErrorView fullScreen={false} message="등록된 전시가 없습니다." />
          )
        ) : personalArtworksQuery.isLoading || exhibitionArtworksQuery.isLoading ? (
          <LoadingView fullScreen={false} message="작품 로딩 중..." />
        ) : personalArtworksQuery.error || exhibitionArtworksQuery.error ? (
          <ErrorView fullScreen={false} message="작품 정보를 불러오지 못했습니다." />
        ) : artworks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {artworks.map((item) => (
              <ArtworkCard
                key={item.id}
                item={item}
                isArtistView
                onOpen={(artwork) =>
                  navigate(
                    artwork.personalArtworkId
                      ? `/personal-artworks/${artwork.personalArtworkId}`
                      : `/artwork/${artwork.artworkId}`,
                  )
                }
              />
            ))}
          </div>
        ) : (
          <ErrorView fullScreen={false} message="등록된 작품이 없습니다." />
        )}
      </section>
    </div>
  );
}
