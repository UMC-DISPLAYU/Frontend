import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayRequestDto,
  GetDisplayMapRequestDto,
  SearchDisplaysRequestDto,
  UpdateDisplayRequestDto,
} from '@/api/dto';
import {
  cancelDisplayScreening,
  createDisplay,
  getDisplayMap,
  hideDisplay,
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

export const useInfiniteSearchDisplays = (params: Omit<SearchDisplaysRequestDto, 'cursor'>) =>
  useInfiniteQuery({
    queryKey: queryKeys.displays.search(params as SearchDisplaysRequestDto),
    queryFn: ({ pageParam = 0 }) =>
      searchDisplays({
        ...params,
        cursor: pageParam,
        size: params.size ?? 20,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext && lastPage.pagination?.nextCursor !== null
        ? lastPage.pagination.nextCursor
        : undefined,
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

// PATCH /v1/display/{displayId}/draft: 공개 중인 전시를 비공개로 전환
export const useHideDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => hideDisplay(displayId),
    onSuccess: (_, displayId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

// POST /v1/display/{displayId}/screenings/{screeningId}/cancel: 등록(심사) 요청 취소
export const useCancelDisplayScreening = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayId, screeningId }: { displayId: number; screeningId: number }) =>
      cancelDisplayScreening(displayId, screeningId),
    // 409(이미 승인·반려·취소됨)여도 화면 상태가 서버와 어긋난 것이므로 실패 시에도 다시 불러온다.
    onSettled: (_, __, { displayId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

// PATCH /v1/display/publish: 전시 공개 심사 신청
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
