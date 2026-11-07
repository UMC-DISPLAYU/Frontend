import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';

import type {
  DisplayListItemDto,
  GetArtworkPreviewRequestDto,
  GetClosingSoonDisplaysRequestDto,
  HomeExhibitionDto,
} from '@/api/dto';
import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getGraduationDisplays,
  getLoungePosts,
  searchDisplays,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { formatDate } from '@/utils/date';

const graduationDisplaysParams = { size: 3 };
const closingSoonDisplaysParams = { size: 3 };
const artworkPreviewParams = { type: 'RECOMMEND' as const, page: 0, size: 10 };
const loungePostsParams = { size: 3 };

const graduationDisplaysQuery = () => ({
  queryKey: queryKeys.displays.graduation(graduationDisplaysParams),
  queryFn: () => getGraduationDisplays(graduationDisplaysParams),
});

const closingSoonDisplaysQuery = (params: GetClosingSoonDisplaysRequestDto = {}) => ({
  queryKey: queryKeys.displays.closingSoon(params),
  queryFn: () => getClosingSoonDisplays(params),
});

const homeArtworkPreviewQuery = () => ({
  queryKey: queryKeys.displayArtworks.preview(artworkPreviewParams),
  queryFn: () => getArtworkPreview(artworkPreviewParams),
});

const homeLoungePostsQuery = () => ({
  queryKey: queryKeys.loungePosts.list(loungePostsParams),
  queryFn: () => getLoungePosts(loungePostsParams),
});

export const useGraduationDisplays = () => useQuery(graduationDisplaysQuery());

export const useClosingSoonDisplays = (params: GetClosingSoonDisplaysRequestDto = {}) =>
  useQuery(closingSoonDisplaysQuery(params));

export const useHomeArtworkPreview = () => useQuery(homeArtworkPreviewQuery());

export const useInfiniteArtworkPreview = (params: GetArtworkPreviewRequestDto = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.displayArtworks.preview(params),
    queryFn: ({ pageParam = 0 }) =>
      getArtworkPreview({
        type: 'RECOMMEND',
        ...params,
        page: pageParam,
        size: params.size ?? 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.isLast ? null : lastPage.page + 1),
  });

export const useHomeLoungePosts = () => useQuery(homeLoungePostsQuery());

export const useHome = () =>
  useQueries({
    queries: [
      graduationDisplaysQuery(),
      closingSoonDisplaysQuery(closingSoonDisplaysParams),
      homeArtworkPreviewQuery(),
      homeLoungePostsQuery(),
    ],
  });

export type HomeExhibitionTab = 'pop' | 'grad' | 'live' | 'soon' | 'end';

export interface HomeExhibitionCard {
  displayId: number;
  title: string;
  posterImageUrl: string;
  organization: string;
  period: string;
  /** 홈 · 검색 응답에 장소가 아직 없어 비어 있다(백엔드 협의 중) */
  place?: string;
  likeCount?: number;
}

const HOME_TAB_SIZE = 10;
const homeTabGraduationParams = { size: HOME_TAB_SIZE };
const homeTabClosingSoonParams = { size: HOME_TAB_SIZE };
const homeTabLiveParams = { status: 'ONGOING', cursor: 0, size: HOME_TAB_SIZE };
const homeTabSoonParams = { status: 'UPCOMING', cursor: 0, size: HOME_TAB_SIZE };

const toHomeCard = (
  display: HomeExhibitionDto | (DisplayListItemDto & Partial<HomeExhibitionDto>),
): HomeExhibitionCard => ({
  displayId: display.displayId,
  title: display.title,
  posterImageUrl: display.posterImageUrl,
  organization:
    display.schoolDepartmentName ||
    [display.organization, display.department].filter(Boolean).join(' '),
  period: `${formatDate(display.startedAt)} - ${formatDate(display.endedAt)}`,
  likeCount: 'likeCount' in display ? display.likeCount : undefined,
});

/**
 * 홈 전시 탭 목록. 선택한 탭의 쿼리만 켠다.
 * 캐시에는 원본 응답을 두고 select 로 바꾼다 — 탐색 화면과 같은 query key 를 쓰기 때문이다.
 */
export const useHomeTabExhibitions = (tab: HomeExhibitionTab) => {
  const graduation = useQuery({
    queryKey: queryKeys.displays.graduation(homeTabGraduationParams),
    queryFn: () => getGraduationDisplays(homeTabGraduationParams),
    enabled: tab === 'grad',
    select: (displays) => displays.map(toHomeCard),
  });
  const closingSoon = useQuery({
    queryKey: queryKeys.displays.closingSoon(homeTabClosingSoonParams),
    queryFn: () => getClosingSoonDisplays(homeTabClosingSoonParams),
    enabled: tab === 'end',
    select: (data) => data.exhibitions.map(toHomeCard),
  });
  // 인기 전시 API가 없어 전시 중 목록을 임시로 같이 쓴다(백엔드 협의 중). API가 생기면 pop 쿼리를 따로 둔다
  const live = useQuery({
    queryKey: queryKeys.displays.search(homeTabLiveParams),
    queryFn: () => searchDisplays(homeTabLiveParams),
    enabled: tab === 'live' || tab === 'pop',
    select: (data) => data.exhibitions.map(toHomeCard),
  });
  const soon = useQuery({
    queryKey: queryKeys.displays.search(homeTabSoonParams),
    queryFn: () => searchDisplays(homeTabSoonParams),
    enabled: tab === 'soon',
    select: (data) => data.exhibitions.map(toHomeCard),
  });

  if (tab === 'grad') return graduation;
  if (tab === 'end') return closingSoon;
  if (tab === 'soon') return soon;
  return live;
};
