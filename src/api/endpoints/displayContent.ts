import type {
  CreateContentCategoryRequestDto,
  CreateContentCategoryResponseDto,
  CreateContentImageRequestDto,
  CreateContentImageResponseDto,
  ReorderContentImagesRequestDto,
  UpdateContentCategoryRequestDto,
  UpdateContentImageRequestDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/display/:displayId/content-categories
export const createContentCategory = async (
  displayId: number,
  body: CreateContentCategoryRequestDto,
): Promise<CreateContentCategoryResponseDto> =>
  apiRequest(`/v1/display/${displayId}/content-categories`, {
    method: 'POST',
    body,
  });

// PATCH /v1/display/:displayId/content-categories/:categoryId
export const updateContentCategory = async (
  displayId: number,
  categoryId: number,
  body: UpdateContentCategoryRequestDto,
): Promise<void> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}`, {
    method: 'PATCH',
    body,
  });

// DELETE /v1/display/:displayId/content-categories/:categoryId
export const deleteContentCategory = async (displayId: number, categoryId: number): Promise<void> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}`, {
    method: 'DELETE',
  });

// POST /v1/display/:displayId/content-categories/:categoryId/contents
export const createContentImage = async (
  displayId: number,
  categoryId: number,
  body: CreateContentImageRequestDto,
): Promise<CreateContentImageResponseDto> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}/contents`, {
    method: 'POST',
    body,
  });

// PATCH /v1/display/:displayId/content-categories/:categoryId/contents/reorder
export const reorderContentImages = async (
  displayId: number,
  categoryId: number,
  body: ReorderContentImagesRequestDto,
): Promise<void> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}/contents/reorder`, {
    method: 'PATCH',
    body,
  });

// PATCH /v1/display/:displayId/content-categories/:categoryId/contents/:contentId
export const updateContentImage = async (
  displayId: number,
  categoryId: number,
  contentId: number,
  body: UpdateContentImageRequestDto,
): Promise<void> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}/contents/${contentId}`, {
    method: 'PATCH',
    body,
  });

// DELETE /v1/display/:displayId/content-categories/:categoryId/contents/:contentId
export const deleteContentImage = async (
  displayId: number,
  categoryId: number,
  contentId: number,
): Promise<void> =>
  apiRequest(`/v1/display/${displayId}/content-categories/${categoryId}/contents/${contentId}`, {
    method: 'DELETE',
  });
