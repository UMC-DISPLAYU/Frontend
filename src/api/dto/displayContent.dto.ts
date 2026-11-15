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

/* imageUrls 는 1~20장. 빈 배열은 서버가 거절한다 */
export type CreateContentCategoryRequestDto = {
  name: string;
  imageUrls?: string[];
};

export type CreateContentCategoryResponseDto = {
  categoryId: number;
};

export type UpdateContentCategoryRequestDto = {
  name: string;
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

/* 전시의 모든 섹션 id 를 중복 없이 보낸다. 누락 · 중복 · 다른 전시 id 는 400 */
export type ReorderContentCategoriesRequestDto = {
  orderedCategoryIds: number[];
};

export type ReorderContentCategoriesResponseDataDto = {
  displayId: number;
  categories: ContentCategoryDto[];
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
