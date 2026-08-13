export type ContentCategoryDto = {
  id?: number;
  categoryId?: number;
  name: string;
  description?: string | null;
  contentCount?: number;
  sortOrder?: number;
  thumbnailUrl?: string;
};

export type ContentImageDto = {
  id?: number;
  contentId?: number;
  imageUrl: string;
  order?: number;
  width?: number;
  height?: number;
  sortOrder?: number;
};

export type CreateContentCategoryRequestDto = {
  name: string;
  description?: string;
};

export type CreateContentCategoryResponseDto = {
  categoryId: number;
};

export type UpdateContentCategoryRequestDto = {
  name: string;
  description?: string;
};

/*
 * 스웨거에는 width/height가 선택으로 나오지만 서버가 원시 int로 받아
 * 값이 없으면 역직렬화 단계에서 요청이 거절됩니다. 그래서 필수로 둡니다.
 */
export type CreateContentImageRequestDto = {
  imageUrl: string;
  width: number;
  height: number;
};

export type CreateContentImageResponseDto = {
  contentId: number;
};

export type ReorderContentImagesRequestDto = {
  orderedContentIds: number[];
};

export type UpdateContentImageRequestDto = {
  imageUrl?: string;
};

export type GetContentCategoriesResponseDto = {
  categories: ContentCategoryDto[];
};

export type GetContentImagesResponseDto = {
  contents: ContentImageDto[];
};
