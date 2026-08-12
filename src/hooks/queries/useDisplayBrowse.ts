import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayRequestDto,
  GetDisplayMapRequestDto,
  SearchDisplaysRequestDto,
  UpdateDisplayRequestDto,
} from '@/api/dto';
import {
  createDisplay,
  getDisplayMap,
  publishDisplay,
  searchDisplays,
  updateDisplay,
} from '@/api/endpoints';
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

// PATCH /v1/display: 전시 기본 정보 수정
export const useUpdateDisplay = (displayId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateDisplayRequestDto) => {
      if (!displayId) throw new Error('displayId is required');
      return updateDisplay(displayId, body);
    },
    onSuccess: () => {
      if (!displayId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

// PATCH /v1/display/publish: 전시 등록하기
export const usePublishDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => publishDisplay(displayId),
    onSuccess: (_, displayId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};
