import { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import ExhibitionIcon from '@/assets/mypage/exhibit.svg';
import FieldIcon from '@/assets/mypage/field.svg';
import SchoolIcon from '@/assets/mypage/school.svg';
import { ErrorView, LoadingView, LoginConfirmModal } from '@/components/common';
import { ArtworkCard, AuthPageHeader } from '@/components/mypage';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';
import {
  useArchiveArtist,
  useArchivedArtists,
  useUnarchiveArtist,
} from '@/hooks/queries/useArchive';
import { useUserArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useUserArtistProfile } from '@/hooks/queries/useUserProfile';
import { useShare } from '@/hooks/useShare';
import { useAuthStore } from '@/stores/authStore';
import type { ArtistProfile, SavedArtworkItem, TabKey } from '@/types/mypage';

export function AuthPage() {
  const navigate = useNavigate();
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);

  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { handleShare } = useShare();

  const artistProfileQuery = useUserArtistProfile(userId);
  const artworksQuery = useUserArtworks(userId, { enabled: activeTab === 'artwork' });
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

  const isSaved = (archivedArtists?.pages.flatMap((page) => page.artists) ?? []).some(
    (artist) => artist.artistId === userId,
  );
  const isSavePending = archiveArtist.isPending || unarchiveArtist.isPending;

  const profile = useMemo<ArtistProfile>(() => {
    const data = artistProfileQuery.data;
    return {
      name: data?.artistName || '작가',
      isVerified: true,
      avatar: data?.profileImageUrl || FALLBACK_PROFILE_IMAGE,
      school: data?.schoolName || '',
      schoolIcon: SchoolIcon,
      field:
        data?.fields
          ?.map((code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code)
          .join(' · ') ?? '',
      fieldIcon: FieldIcon,
      exhibit: '-',
      exhibitionIcon: ExhibitionIcon,
      bio: data?.introduction ?? '',
      portfolioUrl: data?.portfolioUrl || data?.externalLink || '',
    };
  }, [artistProfileQuery.data]);

  const artworks = useMemo<SavedArtworkItem[]>(() => {
    const items = artworksQuery.data ?? [];
    return items.map((item) => ({
      id: String(item.personalArtworkId),
      artworkId: item.personalArtworkId,
      title: item.artworkName,
      artist: profile.name,
      thumbnail: item.thumbnailUrl ?? '',
    }));
  }, [artworksQuery.data, profile.name]);

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
    <div className="w-96 mx-auto h-dvh bg-gray-100 flex flex-col">
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
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {activeTab === 'exhibition' ? (
          // 다른 작가의 전시 목록을 조회하는 API가 아직 없어 준비 중 안내만 표시합니다.
          <ErrorView fullScreen={false} message="전시 정보를 준비 중입니다." />
        ) : artworksQuery.isLoading ? (
          <LoadingView fullScreen={false} message="작품 로딩 중..." />
        ) : artworksQuery.error ? (
          <ErrorView fullScreen={false} message="작품 정보를 불러오지 못했습니다." />
        ) : artworks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {artworks.map((item) => (
              <ArtworkCard
                key={item.id}
                item={item}
                isArtistView
                onOpen={(artwork) =>
                  navigate(`/personal-artworks/${artwork.artworkId ?? artwork.id}`)
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
