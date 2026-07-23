import { useQuery } from '@tanstack/react-query';

import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getDuPicks,
  getGraduationDisplays,
  getLoungePosts,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const graduationDisplaysParams = { size: 3 };
const duPicksParams = { cursor: 1, size: 4 };
const artworkPreviewParams = { type: 'RECOMMEND' as const, page: 0, size: 10 };
const loungePostsParams = { size: 3 };

export const useGraduationDisplays = () =>
  useQuery({
    queryKey: queryKeys.displays.graduation(graduationDisplaysParams),
    queryFn: () => getGraduationDisplays(graduationDisplaysParams),
  });

export const useClosingSoonDisplays = () =>
  useQuery({
    queryKey: queryKeys.displays.closingSoon(),
    queryFn: getClosingSoonDisplays,
  });

export const useDuPicks = () =>
  useQuery({
    queryKey: queryKeys.displays.duPicks(duPicksParams),
    queryFn: () => getDuPicks(duPicksParams),
  });

export const useHomeArtworkPreview = () =>
  useQuery({
    queryKey: queryKeys.displayArtworks.preview(artworkPreviewParams),
    queryFn: () => getArtworkPreview(artworkPreviewParams),
  });

export const useHomeLoungePosts = () =>
  useQuery({
    queryKey: queryKeys.loungePosts.list(loungePostsParams),
    queryFn: () => getLoungePosts(loungePostsParams),
  });
