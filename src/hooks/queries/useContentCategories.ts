import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateContentCategoryRequestDto, UpdateContentCategoryRequestDto } from '@/api/dto';
import {
  createContentCategory,
  createContentImage,
  deleteContentCategory,
  reorderContentCategories,
  updateContentCategory,
} from '@/api/endpoints/displayContent';
import { queryKeys } from '@/api/queryKeys';
import { DEFAULT_CONTENT_IMAGE_HEIGHT, DEFAULT_CONTENT_IMAGE_WIDTH } from '@/constants';

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

// PATCH /v1/display/{displayId}/content-categories/reorder
// 다시 불러오기까지 기다린 뒤 끝나게 한다. 그 사이 다음 순서 변경이 들어오면 앞선 결과가 덮어써 순서가 튄다
export const useReorderContentCategories = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedCategoryIds: number[]) =>
      reorderContentCategories(displayId, { orderedCategoryIds }),
    onSuccess: () =>
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

/*
 * 섹션 추가(프로토타입 11-15): 제목과 사진 1장 이상을 한 번에 저장한다.
 * 섹션을 만든 뒤 사진을 순서대로 붙이고, 붙이지 못한 사진 수를 돌려준다(섹션은 이미 만들어졌으므로)
 */
// POST /v1/display/{displayId}/content-categories → POST .../content-categories/{categoryId}/contents
export const useCreateSectionWithPhotos = (displayId: number) => {
  const invalidate = useInvalidateDisplayDetail(displayId);

  return useMutation({
    mutationFn: async ({ title, imageUrls }: { title: string; imageUrls: string[] }) => {
      const { categoryId } = await createContentCategory(displayId, { name: title });
      let failedCount = 0;
      for (const imageUrl of imageUrls) {
        try {
          await createContentImage(displayId, categoryId, {
            imageUrl,
            width: DEFAULT_CONTENT_IMAGE_WIDTH,
            height: DEFAULT_CONTENT_IMAGE_HEIGHT,
          });
        } catch {
          failedCount += 1;
        }
      }
      return { categoryId, failedCount };
    },
    onSettled: invalidate,
  });
};
