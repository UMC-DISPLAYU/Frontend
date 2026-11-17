import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

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

type SearchDisplaysPageParam = Pick<SearchDisplaysRequestDto, 'cursor' | 'cursorLikeCount'>;

export const useInfiniteSearchDisplays = ({
  enabled = true,
  ...params
}: Omit<SearchDisplaysRequestDto, 'cursor' | 'cursorLikeCount'> & { enabled?: boolean }) =>
  useInfiniteQuery({
    queryKey: queryKeys.displays.search(params as SearchDisplaysRequestDto),
    // 검색어 · 필터를 바꾸는 동안 이전 결과를 두어 목록이 스켈레톤으로 깜빡이지 않게 한다
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) =>
      searchDisplays({
        ...params,
        ...pageParam,
        size: params.size ?? 20,
      }),
    initialPageParam: { cursor: 0 } as SearchDisplaysPageParam,
    getNextPageParam: ({ pagination }): SearchDisplaysPageParam | undefined => {
      if (!pagination?.hasNext || pagination.nextCursor == null) return undefined;
      if (params.sort !== 'LIKES') return { cursor: pagination.nextCursor };
      // 좋아요순은 같은 좋아요 수 안에서 ID 로 이어 받으므로 마지막 좋아요 수가 없으면 이어 받지 않는다
      if (pagination.nextCursorLikeCount == null) return undefined;
      return { cursor: pagination.nextCursor, cursorLikeCount: pagination.nextCursorLikeCount };
    },
    enabled,
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
    // 작품 상세(exhibitionInfo) · 작품 검색(displayTitle) · 보관함 전시도 전시 제목 · 포스터 등을 담아 온다
    onSuccess: () => {
      if (!displayId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
    },
  });
};

// PATCH /v1/display/{displayId}/draft: 공개 중인 전시를 비공개로 전환
export const useHideDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => hideDisplay(displayId),
    // 비공개가 되면 그 전시 작품이 작품 검색 · 작가 프로필 · 홈 작품 목록에서 빠질 수 있다
    onSuccess: (_, displayId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
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
