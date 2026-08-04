import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateContentCategoryRequestDto, UpdateContentCategoryRequestDto } from '@/api/dto';
import {
  createContentCategory,
  deleteContentCategory,
  updateContentCategory,
} from '@/api/endpoints/displayContent';
import { queryKeys } from '@/api/queryKeys';

/* 카테고리 변경 후 전시 상세(콘텐츠 목록 포함)를 다시 불러옵니다. */
const useInvalidateDisplayDetail = (displayId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
  };
};

// POST /v1/display/{displayId}/content-categories
export const useCreateContentCategory = (displayId: number) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (body: CreateContentCategoryRequestDto) => createContentCategory(displayId, body),
    onSuccess: invalidate,
  });
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

// DELETE /v1/display/{displayId}/content-categories/{categoryId}
export const useDeleteContentCategory = (displayId: number) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (categoryId: number) => deleteContentCategory(displayId, categoryId),
    onSuccess: invalidate,
  });
};
