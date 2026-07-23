import { useQuery } from '@tanstack/react-query';

import { getHealth } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.health.all,
    queryFn: getHealth,
  });
