import { useQuery } from '@tanstack/react-query';

import { getReceivedArtworkQuestions } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useReceivedArtworkQuestions = (params?: { cursor?: string; size?: number }) =>
  useQuery({
    queryKey: [...queryKeys.artworkQuestions.lists(), 'received', params],
    queryFn: () => getReceivedArtworkQuestions(params),
  });
