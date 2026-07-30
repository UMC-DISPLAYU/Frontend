import { useQueries, useQuery } from '@tanstack/react-query';

import type { GetClosingSoonDisplaysRequestDto } from '@/api/dto';
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
const duPicksParams = { cursor: 1, size: 4 };
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

export const useHomeLoungePosts = () => useQuery(homeLoungePostsQuery());

export const useHome = () =>
  useQueries({
    queries: [
      graduationDisplaysQuery(),
      closingSoonDisplaysQuery(closingSoonDisplaysParams),
      duPicksQuery(),
      homeArtworkPreviewQuery(),
      homeLoungePostsQuery(),
    ],
  });
