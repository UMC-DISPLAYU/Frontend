export type ContentCategoryDto = {
  id?: number;
  categoryId?: number;
  name: string;
  description: string;
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
  description: string;
};

export type CreateContentCategoryResponseDto = {
  categoryId: number;
};

export type UpdateContentCategoryRequestDto = {
  name?: string;
  description?: string;
};

export type CreateContentImageRequestDto = {
  imageUrl: string;
  width?: number;
  height?: number;
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
