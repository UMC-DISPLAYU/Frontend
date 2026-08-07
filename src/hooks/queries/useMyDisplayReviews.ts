import { useQuery } from '@tanstack/react-query';

import { getMyDisplayReviews } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useMyDisplayReviews = (params?: { cursorId?: number; size?: number }) =>
  useQuery({
    queryKey: [...queryKeys.displays.reviews(0), 'me', params],
    queryFn: () => getMyDisplayReviews(params),
  });
