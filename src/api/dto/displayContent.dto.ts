export type ContentCategoryDto = {
  id: number;
  name: string;
  description: string;
  contentCount: number;
  thumbnailUrl?: string;
};

export type ContentImageDto = {
  id: number;
  imageUrl: string;
  order: number;
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
};

export type CreateContentImageResponseDto = {
  contentId: number;
};

export type ReorderContentImagesRequestDto = {
  contentOrders: {
    contentId: number;
    order: number;
  }[];
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
