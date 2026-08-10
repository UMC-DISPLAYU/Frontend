import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';

import type { GetArtworkPreviewRequestDto, GetClosingSoonDisplaysRequestDto } from '@/api/dto';
import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getDuPicks,
  getGraduationDisplays,
  getLoungePosts,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const graduationDisplaysParams = { size: 3 };
const closingSoonDisplaysParams = { size: 3 };
const duPicksParams = { size: 4 };
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

const duPicksQuery = () => ({
  queryKey: queryKeys.displays.duPicks(duPicksParams),
  queryFn: () => getDuPicks(duPicksParams),
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

export const useDuPicks = () => useQuery(duPicksQuery());

export const useHomeArtworkPreview = () => useQuery(homeArtworkPreviewQuery());

export const useInfiniteArtworkPreview = (params: GetArtworkPreviewRequestDto = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.displayArtworks.preview(params),
    queryFn: ({ pageParam = 0 }) =>
      getArtworkPreview({
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
