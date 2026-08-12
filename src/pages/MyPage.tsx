import { useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import type { ArchivedArtistDto, ArchivedArtworkDto, ArchivedExhibitionDto } from '@/api/dto';
import ExhibitionIcon from '@/assets/mypage/exhibit.svg';
import FieldIcon from '@/assets/mypage/field.svg';
import SchoolIcon from '@/assets/mypage/school.svg';
import { ErrorView, LoadingView } from '@/components/common';
import {
  ArtistCard,
  ArtworkCard,
  ExhibitionCard,
  MyPageHeader,
  SettingsSheet,
} from '@/components/mypage';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';
import {
  useArchivedArtists,
  useArchivedExhibitions,
  useDeleteArchivedArtworkMemo,
  useDeleteArchivedExhibitionMemo,
  useInfiniteArchivedArtworks,
  useUnarchiveArtist,
  useUnarchiveArtwork,
  useUnarchiveExhibition,
  useUnarchivePersonalArtwork,
  useUpdateArchivedArtworkMemo,
  useUpdateArchivedExhibitionMemo,
} from '@/hooks/queries/useArchive';
import { useMyArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';
import { useMyArtistProfile, useUserMe } from '@/hooks/queries/useUserProfile';
import { useShare } from '@/hooks/useShare';
import { useMyPageStore } from '@/stores/useMyPageStore';
import type { ArtistItem, ExhibitionItem, SavedArtworkItem } from '@/types/mypage';

const STATUS_LABEL: Record<string, string> = {
  ONGOING: '전시 중',
  UPCOMING: '전시 예정',
  ENDED: '전시 종료',
};

const formatMonthDay = (date: string | null | undefined) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  if (!month || !day) return date;
  return `${month}.${day}`;
};

type ImageLike = {
  thumbnailUrl?: string | null;
  posterImageUrl?: string | null;
  profileImageUrl?: string | null;
  artworkImageUrl?: string | null;
  imageUrl?: string | null;
  images?: { imageUrl?: string | null }[];
  posterImages?: { imageUrl?: string | null }[];
};

type ArchivedExhibitionView = ArchivedExhibitionDto & {
  archiveDisplayId?: number;
  name?: string;
  department?: string;
  startedAt?: string;
  endedAt?: string;
  locationName?: string;
};

type ArchivedArtworkView = ArchivedArtworkDto &
  ImageLike & {
    savedArtworkId?: number;
    title?: string;
    artworkTitle?: string;
    artist?: string;
    artistName?: string;
  };

type ArchivedArtistView = ArchivedArtistDto &
  ImageLike & {
    nickname?: string;
    artistName?: string;
    fields?: string[];
    artworkCount?: number;
    registeration?: number;
    exhibitionCount?: number;
    exhibition?: number;
    memo?: string | null;
  };

/*
 * 이미지가 없을 때의 대체 이미지는 항목 종류에 따라 다릅니다.
 * 사람(작가)은 기본 프로필 아이콘, 전시/작품 썸네일은 빈 값으로 두고 카드에서 처리합니다.
 */
const getImageUrl = (item: ImageLike, fallback = '') =>
  item.thumbnailUrl ||
  item.posterImageUrl ||
  item.profileImageUrl ||
  item.artworkImageUrl ||
  item.imageUrl ||
  item.images?.[0]?.imageUrl ||
  item.posterImages?.[0]?.imageUrl ||
  fallback;

export function MyPage() {
  const navigate = useNavigate();
  const { activeTab, isArtistView, isSettingsOpen, setIsSettingsOpen, toggleArtistView } =
    useMyPageStore();

  const { data: userData, isLoading: isUserLoading, error: userError } = useUserMe();
  const { handleShare: shareUtil } = useShare();

  // 작가 인증 여부에 따라 초기 뷰 설정
  useEffect(() => {
    if (userData) {
      const shouldShowArtistView = userData.isVerified;
      if (shouldShowArtistView !== isArtistView) {
        toggleArtistView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.isVerified]); // isArtistView, toggleArtistView는 의존성에서 제외 (무한 루프 방지)
  const archivedExhibitionsQuery = useArchivedExhibitions();
  const archivedArtworksQuery = useInfiniteArchivedArtworks({ size: 20 });
  const archivedArtistsQuery = useArchivedArtists();
  const myArtistProfileQuery = useMyArtistProfile({
    enabled: isArtistView,
  });
  const myDisplaysQuery = useMyDisplays({
    enabled: isArtistView && activeTab === 'exhibition',
  });
  const myArtworksQuery = useMyArtworks({
    enabled: isArtistView && activeTab === 'artwork',
  });
  const unarchiveExhibition = useUnarchiveExhibition();
  const unarchiveArtwork = useUnarchiveArtwork();
  const unarchivePersonalArtwork = useUnarchivePersonalArtwork();
  const unarchiveArtist = useUnarchiveArtist();
  const updateExhibitionMemo = useUpdateArchivedExhibitionMemo();
  const deleteExhibitionMemo = useDeleteArchivedExhibitionMemo();
  const updateArtworkMemo = useUpdateArchivedArtworkMemo();
  const deleteArtworkMemo = useDeleteArchivedArtworkMemo();

  const profile = useMemo(
    () => ({
      name: isArtistView
        ? myArtistProfileQuery.data?.artistName || userData?.nickname || userData?.name || '사용자'
        : userData?.nickname || userData?.name || '사용자',
      avatar: isArtistView
        ? myArtistProfileQuery.data?.profileImageUrl ||
          userData?.profileImageUrl ||
          FALLBACK_PROFILE_IMAGE
        : userData?.profileImageUrl || FALLBACK_PROFILE_IMAGE,
      caption: '내가 저장한 작품 확인하기',
      isVerified: Boolean(userData?.isVerified),
      school: myArtistProfileQuery.data?.schoolName || userData?.schoolEmail?.split('@')[1] || '',
      schoolIcon: SchoolIcon,
      field:
        myArtistProfileQuery.data?.fields
          ?.map((code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code)
          .join(' · ') ?? '',
      fieldIcon: FieldIcon,
      exhibit: `${myDisplaysQuery.data?.length ?? 0}_작`,
      exhibitionIcon: ExhibitionIcon,
      bio: myArtistProfileQuery.data?.introduction ?? '',
      portfolioUrl:
        myArtistProfileQuery.data?.portfolioUrl || myArtistProfileQuery.data?.externalLink || '',
    }),
    [isArtistView, myArtistProfileQuery.data, myDisplaysQuery.data?.length, userData],
  );

  const exhibitions = useMemo<ExhibitionItem[]>(() => {
    const items = (archivedExhibitionsQuery.data?.displays ?? []) as ArchivedExhibitionView[];
    return items.map((item) => ({
      id: String(item.archiveDisplayId ?? item.displayId),
      archiveDisplayId: item.archiveDisplayId ?? item.displayId,
      displayId: item.displayId,
      userId: item.userId ?? userData?.id,
      status: STATUS_LABEL[item.status] ?? item.status ?? '전시 중',
      title: item.title ?? item.name ?? '',
      org: [item.organization, item.department].filter(Boolean).join(' '),
      period: `${formatMonthDay(item.startedAt)} - ${formatMonthDay(item.endedAt)}`,
      place: item.locationName ?? item.location ?? '',
      thumbnail: getImageUrl(item),
      memo: item.memo ?? undefined,
    }));
  }, [archivedExhibitionsQuery.data, userData?.id]);

  const myExhibitions = myDisplaysQuery.data ?? [];

  const artworks = useMemo<SavedArtworkItem[]>(() => {
    const items = (archivedArtworksQuery.data?.pages.flatMap((page) => page.works) ??
      []) as ArchivedArtworkView[];
    return items.map((item) => ({
      id: String(item.archiveWorkId ?? item.savedArtworkId ?? item.artworkId),
      archiveWorkId: item.archiveWorkId ?? item.savedArtworkId ?? item.artworkId,
      artworkId: item.artworkId,
      personalArtworkId: item.personalArtworkId,
      userId: item.userId ?? userData?.id,
      title: item.artworkName ?? item.title ?? item.artworkTitle ?? '작품',
      artist: item.artist ?? item.artistName ?? '',
      thumbnail: getImageUrl(item),
      memo: item.memo ?? undefined,
    }));
  }, [archivedArtworksQuery.data, userData?.id]);

  const myArtworks = useMemo<SavedArtworkItem[]>(() => {
    const items = myArtworksQuery.data ?? [];
    return items.map((item) => ({
      id: String(item.personalArtworkId),
      artworkId: item.personalArtworkId,
      personalArtworkId: item.personalArtworkId,
      title: item.artworkName,
      artist: userData?.nickname || userData?.name || '',
      thumbnail: item.thumbnailUrl ?? '',
    }));
  }, [myArtworksQuery.data, userData]);

  const artists = useMemo<ArtistItem[]>(() => {
    const items = (archivedArtistsQuery.data?.pages.flatMap((page) => page.artists) ??
      []) as ArchivedArtistView[];
    return items.map((item) => ({
      id: String(item.archiveArtistId ?? item.artistId),
      artistId: item.artistId,
      artistUserId: item.artistUserId,
      name: item.artistName ?? item.nickname ?? '작가',
      field: item.fields?.join(', ') ?? '',
      registeration: String(item.artworkCount ?? item.registeration ?? 0),
      exhibition: String(item.exhibitionCount ?? item.exhibition ?? 0),
      thumbnail: getImageUrl(item, FALLBACK_PROFILE_IMAGE),
      memo: item.memo ?? undefined,
    }));
  }, [archivedArtistsQuery.data]);

  const activeQuery =
    activeTab === 'exhibition'
      ? isArtistView
        ? myDisplaysQuery
        : archivedExhibitionsQuery
      : activeTab === 'artwork'
        ? // 가짜 컴포넌트 연결: 작가 뷰 작품 탭에서만 GET /artworks/me 결과를 사용합니다.
          isArtistView
          ? myArtworksQuery
          : archivedArtworksQuery
        : archivedArtistsQuery;

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  const handleToggleView = () => {
    if (!userData?.isVerified) {
      return;
    }

    toggleArtistView();
  };

  const handleSaveExhibitionMemo = (item: ExhibitionItem, value: string) => {
    const memo = value.trim();
    if (memo) {
      updateExhibitionMemo.mutate({
        archiveDisplayId: item.archiveDisplayId ?? Number(item.id),
        body: { content: memo },
      });
      return;
    }
  };

  const handleSaveArtworkMemo = (item: SavedArtworkItem, value: string) => {
    const memo = value.trim();
    if (memo) {
      updateArtworkMemo.mutate({
        archiveWorkId: item.archiveWorkId ?? Number(item.id),
        body: { content: memo },
      });
      return;
    }
  };

  const handleDeleteExhibitionMemo = (item: ExhibitionItem) => {
    if (item.memo) {
      deleteExhibitionMemo.mutate(item.archiveDisplayId ?? Number(item.id));
    }
  };

  const handleDeleteArtworkMemo = (item: SavedArtworkItem) => {
    if (item.memo) {
      deleteArtworkMemo.mutate(item.archiveWorkId ?? Number(item.id));
    }
  };

  if (isUserLoading) {
    return <LoadingView message="프로필 로딩 중..." />;
  }

  if (userError || !userData) {
    return (
      <ErrorView
        message={userError?.message || '프로필 정보를 불러오지 못했습니다.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const isArtistVerified = userData.isVerified;
  const emptyMessage = `${activeTab === 'exhibition' ? '전시' : activeTab === 'artwork' ? '작품' : '작가'} 데이터가 없습니다.`;

  const handleShare = async () => {
    const url = `${window.location.origin}/artist/${userData.id}`;
    await shareUtil(url, `${profile.name} 작가님`);
  };

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-page flex flex-col">
      <MyPageHeader
        onVerifyArtist={() => {
          navigate('/artist-verification');
        }}
        onShare={handleShare}
        onToggleView={handleToggleView}
        profile={profile}
        isArtistVerified={isArtistVerified}
      />

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6 bg-box">
        {activeQuery.isLoading ? (
          <LoadingView
            fullScreen={false}
            message="저장 목록 로딩 중..."
            className="bg-transparent"
          />
        ) : activeQuery.error ? (
          <ErrorView
            fullScreen={false}
            message="저장 목록을 불러오지 못했습니다."
            className="bg-transparent"
          />
        ) : activeTab === 'exhibition' &&
          (isArtistView ? myExhibitions : exhibitions).length > 0 ? (
          <div className="flex flex-col gap-4">
            {(isArtistView ? myExhibitions : exhibitions).map((item) => (
              <ExhibitionCard
                key={item.id}
                item={item}
                isArtistView={isArtistView}
                onUnarchive={(exhibition) => {
                  if (window.confirm('저장한 전시에서 삭제할까요?')) {
                    unarchiveExhibition.mutate(exhibition.displayId ?? Number(exhibition.id));
                  }
                }}
                onSaveMemo={handleSaveExhibitionMemo}
                onDeleteMemo={handleDeleteExhibitionMemo}
                onOpen={(exhibition) =>
                  navigate(`/display/${exhibition.displayId ?? exhibition.id}`)
                }
              />
            ))}
          </div>
        ) : activeTab === 'artwork' && (isArtistView ? myArtworks : artworks).length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {/* 가짜 컴포넌트 연결: 작가 뷰에서는 내 작품 전체 조회 mock 데이터를 렌더링합니다. */}
            {(isArtistView ? myArtworks : artworks).map((item) => (
              <ArtworkCard
                key={item.id}
                item={item}
                isArtistView={isArtistView}
                onUnarchive={(artwork) => {
                  if (window.confirm('저장한 작품에서 삭제할까요?')) {
                    if (artwork.personalArtworkId) {
                      unarchivePersonalArtwork.mutate(artwork.personalArtworkId);
                    } else {
                      unarchiveArtwork.mutate(artwork.artworkId ?? Number(artwork.id));
                    }
                  }
                }}
                onSaveMemo={handleSaveArtworkMemo}
                onDeleteMemo={handleDeleteArtworkMemo}
                onOpen={(artwork) =>
                  navigate(
                    isArtistView
                      ? `/personal-artworks/${artwork.artworkId ?? artwork.id}`
                      : `/artwork/${artwork.artworkId ?? artwork.id}`,
                  )
                }
              />
            ))}
          </div>
        ) : activeTab === 'artist' && artists.length > 0 ? (
          <div className="flex flex-col gap-3">
            {artists.map((item) => (
              <ArtistCard
                key={item.id}
                item={item}
                onOpen={(artist) => navigate(`/artist/${artist.artistUserId ?? artist.id}`)}
                onUnarchive={(artist) => {
                  if (window.confirm('저장한 작가에서 삭제할까요?')) {
                    unarchiveArtist.mutate(artist.artistUserId ?? Number(artist.id));
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <ErrorView fullScreen={false} message={emptyMessage} className="bg-transparent" />
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
