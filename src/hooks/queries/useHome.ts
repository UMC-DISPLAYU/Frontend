import { useQueries, useQuery } from '@tanstack/react-query';

import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getDuPicks,
  getGraduationDisplays,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const graduationDisplaysQuery = () => ({
  queryKey: queryKeys.displays.graduation(),
  queryFn: getGraduationDisplays,
});

const closingSoonDisplaysQuery = () => ({
  queryKey: queryKeys.displays.closingSoon(),
  queryFn: getClosingSoonDisplays,
});

const duPicksQuery = () => ({
  queryKey: queryKeys.displays.duPicks(),
  queryFn: getDuPicks,
});

const homeArtworkPreviewQuery = () => ({
  queryKey: queryKeys.displayArtworks.preview(),
  queryFn: () => getArtworkPreview(),
});

export const useGraduationDisplays = () => useQuery(graduationDisplaysQuery());

export const useClosingSoonDisplays = () => useQuery(closingSoonDisplaysQuery());

export const useDuPicks = () => useQuery(duPicksQuery());

export const useHomeArtworkPreview = () => useQuery(homeArtworkPreviewQuery());

export const useHome = () =>
  useQueries({
    queries: [
      graduationDisplaysQuery(),
      closingSoonDisplaysQuery(),
      duPicksQuery(),
      homeArtworkPreviewQuery(),
    ],
  });
