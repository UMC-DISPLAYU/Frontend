import type { ApiResponseDto } from './common.dto';

export interface UploadCategoryImagesResponseDataDto {
  categoryId: number;
  uploadedCount: number;
  imageUrls: string[];
}

export type UploadCategoryImagesResponseDto = ApiResponseDto<UploadCategoryImagesResponseDataDto>;

export interface CreateDisplayCategoryRequestDto {
  categoryName: string;
  categoryDescription: string | null;
}

export interface CreateDisplayCategoryResponseDataDto {
  categoryId: number;
  displayId: number;
  categoryName: string;
  categoryDescription: string | null;
}

export type CreateDisplayCategoryResponseDto = ApiResponseDto<CreateDisplayCategoryResponseDataDto>;

export interface UpdateDisplayCategoryRequestDto {
  categoryName: string;
  categoryDescription: string | null;
}

export interface UpdateDisplayCategoryResponseDataDto {
  categoryId: number;
  categoryName: string;
  categoryDescription: string | null;
}

export type UpdateDisplayCategoryResponseDto = ApiResponseDto<UpdateDisplayCategoryResponseDataDto>;

export interface DeleteDisplayCategoryResponseDataDto {
  deletedCategoryId: number;
  message: string;
}

export type DeleteDisplayCategoryResponseDto = ApiResponseDto<DeleteDisplayCategoryResponseDataDto>;

export interface DeleteDisplayContentResponseDataDto {
  contentId: number;
  deleted: boolean;
}

export type DeleteDisplayContentResponseDto = ApiResponseDto<DeleteDisplayContentResponseDataDto>;
