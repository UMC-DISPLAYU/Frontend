import { useQuery } from '@tanstack/react-query';

import { getAgreements } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useAgreements = () =>
  useQuery({
    queryKey: queryKeys.agreements.signup(),
    queryFn: getAgreements,
    staleTime: 1000 * 60 * 10,
  });
