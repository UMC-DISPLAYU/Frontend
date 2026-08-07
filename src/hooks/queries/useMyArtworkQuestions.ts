import { useQuery } from '@tanstack/react-query';

import { getMyArtworkQuestions } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useMyArtworkQuestions = (params?: { cursor?: string; size?: number }) =>
  useQuery({
    queryKey: [...queryKeys.artworkQuestions.lists(), 'me', params],
    queryFn: () => getMyArtworkQuestions(params),
  });
