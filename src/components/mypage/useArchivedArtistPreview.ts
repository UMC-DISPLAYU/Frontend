import { useMemo } from 'react';

import { toArtistProfileFieldLabels } from '@/constants/artistField';
import { useArtistExhibitionArtworks, useUserArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useUserArtistProfile } from '@/hooks/queries/useUserProfile';
import { useSkeleton } from '@/hooks/useSkeleton';

const PREVIEW_COUNT = 3;

/**
 * 저장한 작가 줄의 "학교 · 분야"와 작품 사진 미리보기.
 * 저장 작가 목록 응답에 학교 · 작품 사진이 없어서 작가 프로필 화면과 같은 쿼리로 받는다(캐시 공유).
 */
export function useArchivedArtistPreview(userId: number, archivedFields: string[]) {
  const profileQuery = useUserArtistProfile(userId);
  const personalArtworksQuery = useUserArtworks(userId);
  const exhibitionArtworksQuery = useArtistExhibitionArtworks(userId);

  const { showSkeleton, skeletonProps } = useSkeleton(profileQuery.isPending);

  const profile = profileQuery.data;
  const description = [
    profile?.schoolName,
    ...toArtistProfileFieldLabels(profile?.fields ?? archivedFields),
  ]
    .filter(Boolean)
    .join(' · ');

  // 작가 프로필 작품 탭과 같은 순서(개인 작품 → 전시 작품). 둘 다 받은 뒤에 보여야 순서가 바뀌지 않는다
  const isArtworksPending = personalArtworksQuery.isPending || exhibitionArtworksQuery.isPending;
  const thumbnails = useMemo(() => {
    if (isArtworksPending) return [];
    return [
      ...(personalArtworksQuery.data ?? []).map((artwork) => artwork.thumbnailUrl),
      ...(exhibitionArtworksQuery.data?.artworks ?? []).map((artwork) => artwork.artworkImageUrl),
    ]
      .filter(Boolean)
      .slice(0, PREVIEW_COUNT);
  }, [isArtworksPending, personalArtworksQuery.data, exhibitionArtworksQuery.data]);

  return {
    description,
    isDescriptionPending: showSkeleton,
    descriptionSkeletonProps: skeletonProps,
    thumbnails,
  };
}
