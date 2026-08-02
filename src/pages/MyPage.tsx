import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { ArchivedArtistDto, ArchivedArtworkDto, ArchivedExhibitionDto } from '@/api/dto';
import DefaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import ExhibitionIcon from '@/assets/exhibit.svg';
import SchoolIcon from '@/assets/image 3666.svg';
import FieldIcon from '@/assets/image 3673.svg';
import { ErrorView, LoadingView } from '@/components/common';
import {
  ArtistCard,
  ArtworkCard,
  ExhibitionCard,
  MyPageHeader,
  SettingsSheet,
} from '@/components/mypage';
import {
  useArchivedArtists,
  useArchivedArtworks,
  useArchivedExhibitions,
  useDeleteArchivedArtworkMemo,
  useDeleteArchivedExhibitionMemo,
  useUnarchiveArtist,
  useUnarchiveArtwork,
  useUnarchiveExhibition,
  useUpdateArchivedArtworkMemo,
  useUpdateArchivedExhibitionMemo,
} from '@/hooks/queries/useArchive';
import { useMyArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';
import { useMyArtistProfile, useUserMe } from '@/hooks/queries/useUserProfile';
import type { ArtistItem, ExhibitionItem, SavedArtworkItem, TabKey } from '@/types/mypage';

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

const getImageUrl = (item: ImageLike) =>
  item.thumbnailUrl ||
  item.posterImageUrl ||
  item.profileImageUrl ||
  item.artworkImageUrl ||
  item.imageUrl ||
  item.images?.[0]?.imageUrl ||
  item.posterImages?.[0]?.imageUrl ||
  DefaultProfileIcon;

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('exhibition');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArtistView, setIsArtistView] = useState(false);

  const { data: userData, isLoading: isUserLoading, error: userError } = useUserMe();
  const archivedExhibitionsQuery = useArchivedExhibitions();
  const archivedArtworksQuery = useArchivedArtworks();
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
  const unarchiveArtist = useUnarchiveArtist();
  const updateExhibitionMemo = useUpdateArchivedExhibitionMemo();
  const deleteExhibitionMemo = useDeleteArchivedExhibitionMemo();
  const updateArtworkMemo = useUpdateArchivedArtworkMemo();
  const deleteArtworkMemo = useDeleteArchivedArtworkMemo();

  const profile = useMemo(
    () => ({
      name: userData?.nickname || userData?.name || '사용자',
      avatar: userData?.profileImageUrl || DefaultProfileIcon,
      caption: '내가 저장한 작품 확인하기',
      isVerified: Boolean(userData?.isVerified),
      school: myArtistProfileQuery.data?.schoolName || userData?.schoolEmail?.split('@')[1] || '',
      schoolIcon: SchoolIcon,
      field: myArtistProfileQuery.data?.fields?.join(' · ') ?? '',
      fieldIcon: FieldIcon,
      exhibit: `${myDisplaysQuery.data?.length ?? 0}_작`,
      exhibitionIcon: ExhibitionIcon,
      bio: myArtistProfileQuery.data?.introduction ?? '',
      portfolioUrl:
        myArtistProfileQuery.data?.portfolioUrl || myArtistProfileQuery.data?.externalLink || '',
    }),
    [myArtistProfileQuery.data, myDisplaysQuery.data?.length, userData],
  );

  const exhibitions = useMemo<ExhibitionItem[]>(() => {
    const items = (archivedExhibitionsQuery.data?.savedExhibitions ??
      []) as ArchivedExhibitionView[];
    return items.map((item) => ({
      id: String(item.savedExhibitionId ?? item.archiveDisplayId ?? item.displayId),
      archiveDisplayId: item.savedExhibitionId ?? item.archiveDisplayId ?? item.displayId,
      displayId: item.displayId,
      status: STATUS_LABEL[item.status] ?? item.status ?? '전시 중',
      title: item.title ?? item.name ?? '',
      org: item.organization ?? item.department ?? '',
      period: `${formatMonthDay(item.startDate ?? item.startedAt)} - ${formatMonthDay(item.endDate ?? item.endedAt)}`,
      place: item.placeName ?? item.locationName ?? '',
      thumbnail: getImageUrl(item),
      memo: item.memo ?? undefined,
    }));
  }, [archivedExhibitionsQuery.data]);

  const myExhibitions = myDisplaysQuery.data ?? [];

  const artworks = useMemo<SavedArtworkItem[]>(() => {
    const items = (archivedArtworksQuery.data?.works ?? []) as ArchivedArtworkView[];
    return items.map((item) => ({
      id: String(item.archiveWorkId ?? item.savedArtworkId ?? item.artworkId),
      archiveWorkId: item.archiveWorkId ?? item.savedArtworkId ?? item.artworkId,
      artworkId: item.artworkId,
      title: item.title ?? item.artworkTitle ?? '작품',
      artist: item.artist ?? item.artistName ?? '',
      thumbnail: getImageUrl(item),
      memo: item.memo ?? undefined,
    }));
  }, [archivedArtworksQuery.data]);

  // 가짜 컴포넌트 연결: 백엔드에 내 작품 전체 조회 API가 생기기 전까지 작가 뷰 작품 탭에서만 사용합니다.
  const myArtworks = useMemo<SavedArtworkItem[]>(() => {
    const items = myArtworksQuery.data?.artworks ?? [];
    return items.map((item) => ({
      id: String(item.artworkId),
      artworkId: item.artworkId,
      title: item.artworkName,
      artist: item.artistName,
      thumbnail: item.artworkImageUrl || DefaultProfileIcon,
    }));
  }, [myArtworksQuery.data]);

  const artists = useMemo<ArtistItem[]>(() => {
    const items = (archivedArtistsQuery.data?.savedArtists ?? []) as ArchivedArtistView[];
    return items.map((item) => ({
      id: String(item.savedArtistId ?? item.artistId),
      artistId: item.artistId,
      name: item.name ?? item.nickname ?? item.artistName ?? '작가',
      field: item.field ?? item.fields?.join(', ') ?? '',
      registeration: String(item.artworkCount ?? item.registeration ?? 0),
      exhibition: String(item.exhibitionCount ?? item.exhibition ?? 0),
      thumbnail: getImageUrl(item),
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

    setIsArtistView((prev) => !prev);
    if (isArtistView && activeTab === 'artist') {
      setActiveTab('exhibition');
    }
  };

  const handleSaveExhibitionMemo = (item: ExhibitionItem, value: string) => {
    const memo = value.trim();
    if (memo) {
      updateExhibitionMemo.mutate({
        archiveDisplayId: item.archiveDisplayId ?? Number(item.id),
        body: { memo },
      });
      return;
    }
  };

  const handleSaveArtworkMemo = (item: SavedArtworkItem, value: string) => {
    const memo = value.trim();
    if (memo) {
      updateArtworkMemo.mutate({
        archiveWorkId: item.archiveWorkId ?? Number(item.id),
        body: { memo },
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
        {activeQuery.isLoading ? (
          <LoadingView fullScreen={false} message="저장 목록 로딩 중..." />
        ) : activeQuery.error ? (
          <ErrorView fullScreen={false} message="저장 목록을 불러오지 못했습니다." />
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
                    unarchiveArtwork.mutate(artwork.artworkId ?? Number(artwork.id));
                  }
                }}
                onSaveMemo={handleSaveArtworkMemo}
                onDeleteMemo={handleDeleteArtworkMemo}
              />
            ))}
          </div>
        ) : activeTab === 'artist' && artists.length > 0 ? (
          <div className="flex flex-col gap-3">
            {artists.map((item) => (
              <ArtistCard
                key={item.id}
                item={item}
                onUnarchive={(artist) => {
                  if (window.confirm('저장한 작가에서 삭제할까요?')) {
                    unarchiveArtist.mutate(artist.artistId ?? Number(artist.id));
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <ErrorView fullScreen={false} message={emptyMessage} />
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
