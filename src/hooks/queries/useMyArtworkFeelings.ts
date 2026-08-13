import { useQuery } from '@tanstack/react-query';

import { getMyArtworkFeelings } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useMyArtworkFeelings = (params?: { cursor?: string; size?: number }) =>
  useQuery({
    queryKey: [...queryKeys.artworkFeelings.lists(), 'my', params],
    queryFn: () => getMyArtworkFeelings(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });
