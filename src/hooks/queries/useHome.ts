import { useQuery } from '@tanstack/react-query';

import type { HomeExhibitionDto } from '@/api/dto';
import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getGraduationDisplays,
  getPopularDisplays,
  searchDisplays,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

const artworkPreviewParams = { type: 'RECOMMEND' as const, page: 0, size: 10 };

export const useHomeArtworkPreview = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.preview(artworkPreviewParams),
    queryFn: () => getArtworkPreview(artworkPreviewParams),
    enabled,
  });

/* 홈 인기 전시와 같은 목록. 마이 보관함 빈 상태처럼 필요할 때만 켠다 */
export const usePopularDisplays = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.displays.popular(),
    queryFn: () => getPopularDisplays(),
    enabled,
  });

export type HomeExhibitionTab = 'pop' | 'grad' | 'live' | 'soon' | 'end';

export interface HomeExhibitionCard {
  displayId: number;
  title: string;
  posterImageUrl: string;
  organization: string;
  period: string;
  place?: string;
}

const HOME_TAB_SIZE = 10;
const homeTabGraduationParams = { size: HOME_TAB_SIZE };
const homeTabClosingSoonParams = { size: HOME_TAB_SIZE };
const homeTabLiveParams = { status: 'ONGOING', cursor: 0, size: HOME_TAB_SIZE };
const homeTabSoonParams = { status: 'UPCOMING', cursor: 0, size: HOME_TAB_SIZE };

const toHomeCard = (display: HomeExhibitionDto): HomeExhibitionCard => ({
  displayId: display.displayId,
  title: display.title,
  posterImageUrl: display.posterImageUrl,
  organization: display.schoolDepartmentName,
  period: formatExhibitionPeriod(display.startedAt, display.endedAt),
  place: display.placeName || undefined,
});

/**
 * 홈 전시 탭 목록. 프로토타입처럼 탭을 바꾸면 바로 보이도록 다섯 탭을 처음부터 함께 받아 두고, 선택한 탭의 결과를 돌려준다.
 * 캐시에는 원본 응답을 두고 select 로 바꾼다 — 탐색 화면과 같은 query key 를 쓰기 때문이다.
 */
export const useHomeTabExhibitions = (tab: HomeExhibitionTab) => {
  const popular = useQuery({
    queryKey: queryKeys.displays.popular(),
    queryFn: () => getPopularDisplays(),
    select: (displays) => displays.map(toHomeCard),
  });
  const graduation = useQuery({
    queryKey: queryKeys.displays.graduation(homeTabGraduationParams),
    queryFn: () => getGraduationDisplays(homeTabGraduationParams),
    select: (displays) => displays.map(toHomeCard),
  });
  const closingSoon = useQuery({
    queryKey: queryKeys.displays.closingSoon(homeTabClosingSoonParams),
    queryFn: () => getClosingSoonDisplays(homeTabClosingSoonParams),
    select: (data) => data.exhibitions.map(toHomeCard),
  });
  const live = useQuery({
    queryKey: queryKeys.displays.search(homeTabLiveParams),
    queryFn: () => searchDisplays(homeTabLiveParams),
    select: (data) => data.exhibitions.map(toHomeCard),
  });
  const soon = useQuery({
    queryKey: queryKeys.displays.search(homeTabSoonParams),
    queryFn: () => searchDisplays(homeTabSoonParams),
    select: (data) => data.exhibitions.map(toHomeCard),
  });

  if (tab === 'pop') return popular;
  if (tab === 'grad') return graduation;
  if (tab === 'end') return closingSoon;
  if (tab === 'soon') return soon;
  return live;
};
