import { useQueries, useQuery } from '@tanstack/react-query';

import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getDuPicks,
  getGraduationDisplays,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useGraduationDisplays = () =>
  useQuery({
    queryKey: queryKeys.displays.graduation(),
    queryFn: getGraduationDisplays,
  });

export const useClosingSoonDisplays = () =>
  useQuery({
    queryKey: queryKeys.displays.closingSoon(),
    queryFn: getClosingSoonDisplays,
  });

export const useDuPicks = () =>
  useQuery({
    queryKey: queryKeys.displays.duPicks(),
    queryFn: getDuPicks,
  });

export const useHomeArtworkPreview = () =>
  useQuery({
    queryKey: queryKeys.displayArtworks.preview(),
    queryFn: () => getArtworkPreview(),
  });

export const useHome = () =>
  useQueries({
    queries: [
      {
        queryKey: queryKeys.displays.graduation(),
        queryFn: getGraduationDisplays,
      },
      {
        queryKey: queryKeys.displays.closingSoon(),
        queryFn: getClosingSoonDisplays,
      },
      {
        queryKey: queryKeys.displays.duPicks(),
        queryFn: getDuPicks,
      },
      {
        queryKey: queryKeys.displayArtworks.preview(),
        queryFn: () => getArtworkPreview(),
      },
    ],
  });
