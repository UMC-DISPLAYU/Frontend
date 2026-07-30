import { useQuery } from '@tanstack/react-query';

import type { GetDisplayMapRequestDto, SearchDisplaysRequestDto } from '@/api/dto';
import { getDisplayMap, searchDisplays } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useSearchDisplays = (params: SearchDisplaysRequestDto) =>
  useQuery({
    queryKey: queryKeys.displays.search(params),
    queryFn: () => searchDisplays(params),
  });

export const useDisplayMap = (params: GetDisplayMapRequestDto) =>
  useQuery({
    queryKey: queryKeys.displays.map(params),
    queryFn: () => getDisplayMap(params),
  });
