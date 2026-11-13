import { useEffect, useMemo } from 'react';

import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';
import {
  useArchiveArtist,
  useArchivedArtists,
  useUnarchiveArtist,
} from '@/hooks/queries/useArchive';
import { useArtistExhibitionArtworks, useUserArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useArtistDisplays } from '@/hooks/queries/useMyDisplays';
import { useUserArtistProfile, useUserMe } from '@/hooks/queries/useUserProfile';
import { isInstagramUrl, toInstagramLink, toWebsiteLink } from '@/utils/externalLink';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

import type { ArtistExhibitionView, ArtistWorkView, ExhibitionState } from './ArtistProfileCards';
import type { ArtistProfileLink } from './ArtistProfileHeader';

const STATE_BY_LABEL: Record<string, ExhibitionState> = {
  '전시 중': 'ongoing',
  '전시 예정': 'upcoming',
  '전시 종료': 'ended',
};

// 전시 중 → 전시 예정 → 종료 순서. 같은 상태 안에서는 응답 순서를 따른다
const STATE_RANK: Record<ExhibitionState, number> = { ongoing: 0, upcoming: 1, ended: 2 };

/* 작가 프로필은 링크를 하나만 저장한다. 인스타그램 주소면 Instagram, 그 밖은 Portfolio 로 보여준다 */
function toProfileLinks(value?: string | null): ArtistProfileLink[] {
  if (!value?.trim()) return [];
  if (isInstagramUrl(value)) {
    const link = toInstagramLink(value);
    return link ? [{ name: 'Instagram', ...link }] : [];
  }
  const link = toWebsiteLink(value);
  return link ? [{ name: 'Portfolio', ...link }] : [];
}

export function useArtistProfile(userId: number) {
  const { data: me } = useUserMe();
  const isOwner = me?.id === userId;

  const profileQuery = useUserArtistProfile(userId);
  const displaysQuery = useArtistDisplays(userId);
  const personalArtworksQuery = useUserArtworks(userId);
  const exhibitionArtworksQuery = useArtistExhibitionArtworks(userId);

  const archivedArtistsQuery = useArchivedArtists({ enabled: !isOwner });
  const archiveArtist = useArchiveArtist();
  const unarchiveArtist = useUnarchiveArtist();

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = archivedArtistsQuery;
  // 저장 여부를 정확히 알려면 저장한 작가 목록을 끝까지 받아야 한다
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isSaved = (archivedArtistsQuery.data?.pages.flatMap((page) => page.artists) ?? []).some(
    (artist) => artist.artistUserId === userId,
  );

  const profile = profileQuery.data;
  const header = useMemo(() => {
    if (!profile) return null;
    const fieldLabels = (profile.fields ?? []).map(
      (code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code,
    );
    return {
      name: profile.artistName || '작가',
      subtitle: [profile.schoolName, ...fieldLabels].filter(Boolean).join(' · '),
      bio: profile.introduction?.trim() ?? '',
      photoUrl: profile.profileImageUrl || null,
      links: toProfileLinks(profile.externalLink || profile.portfolioUrl),
    };
  }, [profile]);

  const exhibitions = useMemo<ArtistExhibitionView[]>(
    () =>
      (displaysQuery.data ?? [])
        .map((display) => ({
          key: display.id,
          to: `/display/${display.displayId}`,
          state: STATE_BY_LABEL[display.status] ?? 'ongoing',
          title: display.title,
          organization: display.org,
          period: display.startDate
            ? formatExhibitionPeriod(display.startDate, display.endDate)
            : display.period,
          place: display.place ?? '',
          posterImageUrl: display.thumbnail || null,
        }))
        .sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state]),
    [displaysQuery.data],
  );

  const works = useMemo<ArtistWorkView[]>(() => {
    const artistName = header?.name ?? '';
    return [
      ...(personalArtworksQuery.data ?? []).map((artwork) => ({
        key: `personal-${artwork.personalArtworkId}`,
        to: `/personal-artworks/${artwork.personalArtworkId}`,
        title: artwork.artworkName,
        artistName,
        imageUrl: artwork.thumbnailUrl || null,
      })),
      ...(exhibitionArtworksQuery.data?.artworks ?? []).map((artwork) => ({
        key: `exhibit-${artwork.artworkId}`,
        to: `/artwork/${artwork.artworkId}`,
        title: artwork.artworkName,
        artistName: artwork.artistName || artistName,
        imageUrl: artwork.artworkImageUrl || null,
      })),
    ];
  }, [personalArtworksQuery.data, exhibitionArtworksQuery.data, header?.name]);

  return {
    isOwner,
    profileQuery,
    header,
    exhibitions,
    isExhibitionsPending: displaysQuery.isPending,
    works,
    isWorksPending: personalArtworksQuery.isPending || exhibitionArtworksQuery.isPending,
    isSaved,
    isSavePending: archiveArtist.isPending || unarchiveArtist.isPending,
    archiveArtist,
    unarchiveArtist,
  };
}
