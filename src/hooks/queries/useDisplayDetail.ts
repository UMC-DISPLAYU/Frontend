import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DisplayDetailDto } from '@/api/dto';
import {
  getDisplayArtworks,
  getDisplayDetail,
  getDisplayReviews,
  toggleDisplayLike,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayDetail = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displays.detail(displayId),
    queryFn: () => getDisplayDetail(displayId),
    enabled: Number.isFinite(displayId),
  });

export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.list(displayId),
    queryFn: () => getDisplayArtworks({ displayId }),
    enabled: Number.isFinite(displayId),
  });

export const useDisplayReviews = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayReviews.list(displayId),
    queryFn: () => getDisplayReviews(displayId),
    enabled: Number.isFinite(displayId),
  });

export const useToggleDisplayLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => toggleDisplayLike(displayId),
    onSuccess: (data, displayId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.lists() });
      queryClient.setQueryData(
        queryKeys.displays.detail(displayId),
        (current: DisplayDetailDto | undefined) =>
          current ? { ...current, likeCount: data.likeCount } : current,
      );
    },
  });
};
