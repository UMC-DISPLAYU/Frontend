import { useQuery } from '@tanstack/react-query';

import { searchAddress } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useAddressSearch = (query: string) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.address.search(trimmed),
    queryFn: ({ signal }) => searchAddress(trimmed, signal),
    enabled: trimmed.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
