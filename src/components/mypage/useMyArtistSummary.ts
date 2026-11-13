import { useArtistExhibitionArtworks, useMyArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';
import { useMyArtistProfile } from '@/hooks/queries/useUserProfile';

import { toFieldLabels } from './useMyArchive';

type UseMyArtistSummaryParams = {
  userId: number | undefined;
  /** 인증한 작가만 작가 카드 · 대표 전시 확인이 필요하다 */
  enabled: boolean;
};

/** 마이 작가 카드 문구("그래픽 · 브랜딩 · 작품 6 · 전시 2")와 대표로 있는 전시 여부 */
export function useMyArtistSummary({ userId, enabled }: UseMyArtistSummaryParams) {
  const artistProfileQuery = useMyArtistProfile({ enabled });
  const myDisplaysQuery = useMyDisplays({ enabled });
  const myArtworksQuery = useMyArtworks({ enabled });
  const exhibitionArtworksQuery = useArtistExhibitionArtworks(userId ?? 0, {
    enabled: enabled && Boolean(userId),
  });

  // 작가 프로필 작품 탭과 수를 맞추려고 개인 작품과 전시에 등록한 작품을 더한다
  const artworkCount =
    (myArtworksQuery.data?.length ?? 0) + (exhibitionArtworksQuery.data?.artworks.length ?? 0);
  const exhibitionCount = myDisplaysQuery.data?.length ?? 0;

  // 0 인 수치는 보이지 않는다
  const summary = [
    toFieldLabels(artistProfileQuery.data?.fields).join(' · '),
    artworkCount ? `작품 ${artworkCount}` : '',
    exhibitionCount ? `전시 ${exhibitionCount}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    artistName: artistProfileQuery.data?.artistName,
    schoolName: artistProfileQuery.data?.schoolName,
    summary,
    isLeaderOfAnyDisplay: (myDisplaysQuery.data ?? []).some((display) => display.isLeader),
  };
}
