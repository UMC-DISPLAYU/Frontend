import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayRequestDto,
  DisplayListResponseDataDto,
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

const splitFilterValues = (value?: string | null) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const mergeDisplaySearchResults = (
  responses: DisplayListResponseDataDto[],
  size: number,
): DisplayListResponseDataDto => {
  const displayMap = new Map<number, DisplayListResponseDataDto['exhibitions'][number]>();

  responses.forEach((response) => {
    response.exhibitions.forEach((exhibition) => {
      if (!displayMap.has(exhibition.displayId)) {
        displayMap.set(exhibition.displayId, exhibition);
      }
    });
  });

  const exhibitions = Array.from(displayMap.values());
  const hasNext = responses.some((response) => response.pagination?.hasNext);

  return {
    exhibitions,
    pagination: {
      hasNext,
      nextCursor: hasNext ? size : null,
      size: exhibitions.length,
    },
  };
};

export const useInfiniteSearchDisplays = (params: Omit<SearchDisplaysRequestDto, 'cursor'>) =>
  useInfiniteQuery({
    queryKey: queryKeys.displays.search(params as SearchDisplaysRequestDto),
    queryFn: async ({ pageParam = 0 }) => {
      const size = params.size ?? 20;
      const fields = splitFilterValues(params.field);

      if (fields.length > 1) {
        const responses = await Promise.all(
          fields.map((field) =>
            searchDisplays({
              ...params,
              cursor: pageParam,
              field,
              size,
            }),
          ),
        );

        return mergeDisplaySearchResults(responses, Number(pageParam) + size);
      }

      return searchDisplays({
        ...params,
        cursor: pageParam,
        size,
      });
    },
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
