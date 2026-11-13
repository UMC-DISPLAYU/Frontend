import { useMemo } from 'react';

import type { ArchivedArtistDto, ArchivedArtworkDto } from '@/api/dto';
import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';
import {
  useArchivedArtists,
  useArchivedExhibitions,
  useInfiniteArchivedArtworks,
} from '@/hooks/queries/useArchive';
import { useHomeArtworkPreview, usePopularDisplays } from '@/hooks/queries/useHome';
import type { TabKey } from '@/types/mypage';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

import type { ArchiveArtistView, ArchiveArtworkView, ArchiveExhibitionView } from './ArchiveCards';
import type { ArchiveRecommendation } from './ArchiveEmpty';

const ARTWORK_PAGE_SIZE = 20;
const RECOMMENDATION_COUNT = 5;

// 목 서버와 이전 응답은 작품 이름 · 이미지를 다른 필드명으로 내려준다
type ArchivedArtworkResponse = ArchivedArtworkDto & {
  title?: string;
  artist?: string;
  thumbnailUrl?: string | null;
};

type ArchivedArtistResponse = Omit<ArchivedArtistDto, 'artistUserId'> & {
  artistUserId?: number;
};

export const toFieldLabels = (fields: string[] | undefined) =>
  (fields ?? []).map((code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code);

/** 보관함 세 탭의 목록 · 수와 빈 상태 추천 목록. 추천은 보고 있는 탭이 비었을 때만 불러온다 */
export function useMyArchive(activeTab: TabKey) {
  const exhibitionsQuery = useArchivedExhibitions();
  const artworksQuery = useInfiniteArchivedArtworks({ size: ARTWORK_PAGE_SIZE });
  const artistsQuery = useArchivedArtists();

  const exhibitions = useMemo<ArchiveExhibitionView[]>(
    () =>
      (exhibitionsQuery.data?.displays ?? []).map((item) => ({
        key: String(item.archiveDisplayId ?? item.displayId),
        to: `/display/${item.displayId}`,
        title: item.title,
        organization: [item.organization, item.department].filter(Boolean).join(' '),
        period: item.startedAt ? formatExhibitionPeriod(item.startedAt, item.endedAt) : '',
        place: item.location ?? '',
        posterImageUrl: item.posterImageUrl || null,
      })),
    [exhibitionsQuery.data],
  );

  const artworks = useMemo<ArchiveArtworkView[]>(
    () =>
      (artworksQuery.data?.pages.flatMap((page) => page.works) ?? []).map((work) => {
        const item = work as ArchivedArtworkResponse;
        return {
          key: String(item.archiveWorkId),
          to: item.personalArtworkId
            ? `/personal-artworks/${item.personalArtworkId}`
            : `/artwork/${item.artworkId}`,
          title: item.artworkName ?? item.title ?? '',
          artistName: item.artistName ?? item.artist ?? '',
          imageUrl: item.artworkImageUrl || item.thumbnailUrl || null,
        };
      }),
    [artworksQuery.data],
  );

  const artists = useMemo(
    () =>
      (artistsQuery.data?.pages.flatMap((page) => page.artists) ?? []).map((artist) => {
        const item = artist as ArchivedArtistResponse;
        const userId = item.artistUserId ?? item.artistId;
        return {
          userId,
          view: {
            key: String(item.archiveArtistId),
            to: `/artist/${userId}`,
            name: item.artistName || '작가',
            description: toFieldLabels(item.fields).join(' · '),
          } satisfies ArchiveArtistView,
        };
      }),
    [artistsQuery.data],
  );

  const isEmpty = {
    exhibition: exhibitionsQuery.isSuccess && exhibitions.length === 0,
    artwork: artworksQuery.isSuccess && artworks.length === 0,
    artist: artistsQuery.isSuccess && artists.length === 0,
  }[activeTab];

  // 작가 탭이 비었을 때도 링크가 '전시 둘러보기'라서 인기 전시 줄을 보여준다
  const popularDisplaysQuery = usePopularDisplays({
    enabled: isEmpty && activeTab !== 'artwork',
  });
  const artworkPreviewQuery = useHomeArtworkPreview({
    enabled: isEmpty && activeTab === 'artwork',
  });

  const recommendations = useMemo<ArchiveRecommendation[]>(() => {
    if (activeTab === 'artwork') {
      return (artworkPreviewQuery.data?.artworks ?? [])
        .slice(0, RECOMMENDATION_COUNT)
        .map((artwork) => ({
          key: String(artwork.artworkId),
          to: `/artwork/${artwork.artworkId}`,
          title: artwork.artworkName,
          subtitle: artwork.artists?.map((item) => item.name).join(', ') || artwork.artistName,
          imageUrl: artwork.artworkImageUrl || null,
        }));
    }
    return (popularDisplaysQuery.data ?? []).slice(0, RECOMMENDATION_COUNT).map((display) => ({
      key: String(display.displayId),
      to: `/display/${display.displayId}`,
      title: display.title,
      // 좁은 카드라 학과는 빼고 학교 이름만 둔다
      subtitle: display.schoolDepartmentName?.split(' ')[0] ?? '',
      imageUrl: display.posterImageUrl || null,
    }));
  }, [activeTab, artworkPreviewQuery.data, popularDisplaysQuery.data]);

  return {
    exhibitionsQuery,
    artworksQuery,
    artistsQuery,
    exhibitions,
    artworks,
    artists,
    counts: {
      exhibition: exhibitions.length,
      artwork: artworks.length,
      artist: artists.length,
    } satisfies Record<TabKey, number>,
    recommendations,
    isRecommendationPending:
      activeTab === 'artwork' ? artworkPreviewQuery.isPending : popularDisplaysQuery.isPending,
  };
}
