import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateContentImageRequestDto } from '@/api/dto';
import {
  createContentImage,
  deleteContentImage,
  reorderContentImages,
} from '@/api/endpoints/displayContent';
import { queryKeys } from '@/api/queryKeys';

type CategoryScope = {
  displayId: number;
  categoryId: number;
};

/* 사진 변경 후 전시 상세(콘텐츠 목록 포함)를 다시 불러옵니다. */
const useInvalidateDisplayDetail = (displayId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
  };
};

// POST /v1/display/{displayId}/content-categories/{categoryId}/contents
export const useCreateContentImage = ({ displayId, categoryId }: CategoryScope) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (body: CreateContentImageRequestDto) =>
      createContentImage(displayId, categoryId, body),
    onSuccess: invalidate,
  });
};

// PATCH /v1/display/{displayId}/content-categories/{categoryId}/contents/reorder
export const useReorderContentImages = ({ displayId, categoryId }: CategoryScope) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (orderedContentIds: number[]) =>
      reorderContentImages(displayId, categoryId, { orderedContentIds }),
    onSuccess: invalidate,
  });
};

// DELETE /v1/display/{displayId}/content-categories/{categoryId}/contents/{contentId}
export const useDeleteContentImage = ({ displayId, categoryId }: CategoryScope) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: (contentId: number) => deleteContentImage(displayId, categoryId, contentId),
    onSuccess: invalidate,
  });
};
