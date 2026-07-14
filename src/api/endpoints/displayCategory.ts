import type {
  CreateDisplayCategoryRequestDto,
  CreateDisplayCategoryResponseDataDto,
  DeleteDisplayCategoryResponseDataDto,
  DeleteDisplayContentResponseDataDto,
  UpdateDisplayCategoryRequestDto,
  UpdateDisplayCategoryResponseDataDto,
  UploadCategoryImagesResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/display-category/:categoryId/images
export const uploadCategoryImages = async (
  categoryId: number,
  body: FormData,
): Promise<UploadCategoryImagesResponseDataDto> =>
  apiRequest(`/v1/display-category/${categoryId}/images`, { method: 'POST', body });

// POST /v1/display/:displayId/categories
export const createDisplayCategory = async (
  displayId: number,
  body: CreateDisplayCategoryRequestDto,
): Promise<CreateDisplayCategoryResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/categories`, { method: 'POST', body });

// PATCH /v1/display-category/:categoryId
export const updateDisplayCategory = async (
  categoryId: number,
  body: UpdateDisplayCategoryRequestDto,
): Promise<UpdateDisplayCategoryResponseDataDto> =>
  apiRequest(`/v1/display-category/${categoryId}`, { method: 'PATCH', body });

// DELETE /v1/display-category/:categoryId
export const deleteDisplayCategory = async (
  categoryId: number,
): Promise<DeleteDisplayCategoryResponseDataDto> =>
  apiRequest(`/v1/display-category/${categoryId}`, { method: 'DELETE' });

// DELETE /v1/display-category/contents/:contentId
export const deleteDisplayContent = async (
  contentId: number,
): Promise<DeleteDisplayContentResponseDataDto> =>
  apiRequest(`/v1/display-category/contents/${contentId}`, { method: 'DELETE' });
