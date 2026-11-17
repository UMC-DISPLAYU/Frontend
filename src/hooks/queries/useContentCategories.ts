import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateContentCategoryRequestDto } from '@/api/dto';
import {
  createContentCategory,
  deleteContentCategory,
  reorderContentCategories,
  updateContentCategory,
} from '@/api/endpoints/displayContent';
import { queryKeys } from '@/api/queryKeys';

import { refetchForNextScreen } from './refetchForNextScreen';
/* 카테고리 변경 후 전시 상세(콘텐츠 목록 포함)를 다시 불러옵니다. */
const useInvalidateDisplayDetail = (displayId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
  };
};

// PATCH /v1/display/{displayId}/content-categories/{categoryId}
export const useUpdateContentCategory = (displayId: number) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: number;
      body: UpdateContentCategoryRequestDto;
    }) => updateContentCategory(displayId, categoryId, body),
    onSuccess: invalidate,
  });
};

// PATCH /v1/display/{displayId}/content-categories/reorder
// 다시 불러오기까지 기다린 뒤 끝나게 한다. 그 사이 다음 순서 변경이 들어오면 앞선 결과가 덮어써 순서가 튄다
// 실패해도 다시 불러온다. 다른 사람이 섹션을 추가 · 삭제해 id 목록이 달라지면 서버가 400 으로 거절하기 때문
export const useReorderContentCategories = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedCategoryIds: number[]) =>
      reorderContentCategories(displayId, { orderedCategoryIds }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) }),
  });
};

// DELETE /v1/display/{displayId}/content-categories/{categoryId}
export const useDeleteContentCategory = (displayId: number) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (categoryId: number) => deleteContentCategory(displayId, categoryId),
    onSuccess: invalidate,
  });
};

/* 섹션 추가(프로토타입 11-15): 제목과 사진 1장 이상을 한 요청으로 저장한다(서버가 한 트랜잭션으로 처리) */
// POST /v1/display/{displayId}/content-categories
export const useCreateSectionWithPhotos = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, imageUrls }: { title: string; imageUrls: string[] }) =>
      createContentCategory(displayId, { name: title, imageUrls }),
    // 응답을 못 받아도 서버엔 저장됐을 수 있어 실패해도 다시 불러온다.
    // 저장 뒤 돌아가는 전시 콘텐츠 목록에 새 섹션 · 사진이 바로 있게 다시 받은 다음 끝난다
    onSettled: () => refetchForNextScreen(queryClient, [queryKeys.displays.detail(displayId)]),
  });
};
