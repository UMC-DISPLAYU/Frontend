import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayRequestDto,
  GetDisplayMapRequestDto,
  SearchDisplaysRequestDto,
} from '@/api/dto';
import { createDisplay, getDisplayMap, searchDisplays } from '@/api/endpoints';
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

export const useCreateDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDisplayRequestDto) => createDisplay(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};
