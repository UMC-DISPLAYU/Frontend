import type {
  ClosingSoonExhibitionDto,
  CreateDisplayAuthorRequestDto,
  CreateDisplayAuthorResponseDataDto,
  CreateDisplayRequestDto,
  CreateDisplayResponseDataDto,
  CreateDisplayReviewRequestDto,
  CreateDisplayReviewResponseDataDto,
  DeleteDisplayResponseDataDto,
  DeleteDisplayReviewResponseDataDto,
  DisplayDetailDto,
  DisplayListResponseDataDto,
  GetClosingSoonDisplaysResponseDataDto,
  GetDisplayArtworksRequestDto,
  GetDisplayArtworksResponseDataDto,
  GetDisplayMapRequestDto,
  GetDisplayMapResponseDataDto,
  GetDisplayReviewsResponseDataDto,
  GetDisplaysRequestDto,
  GetDuPicksRequestDto,
  GetDuPicksResponseDataDto,
  HomeExhibitionDto,
  PublishDisplayResponseDataDto,
  SearchDisplaysRequestDto,
  ToggleDisplayLikeResponseDataDto,
  UpdateDisplayDetailsRequestDto,
  UpdateDisplayDetailsResponseDataDto,
  UpdateDisplayRequestDto,
  UpdateDisplayResponseDataDto,
  UpdateDisplayReviewRequestDto,
  UpdateDisplayReviewResponseDataDto,
  UpdateDisplayVisibilityRequestDto,
  UpdateDisplayVisibilityResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/display/graduation
export const getGraduationDisplays = async (params?: {
  size?: number;
}): Promise<HomeExhibitionDto[]> => {
  const data = await apiRequest<{ exhibitions: HomeExhibitionDto[] }>('/v1/display/graduation', {
    query: params,
  });

  return data.exhibitions;
};

// GET /v1/display/closing-soon
export const getClosingSoonDisplays = async (): Promise<ClosingSoonExhibitionDto[]> => {
  const data = await apiRequest<GetClosingSoonDisplaysResponseDataDto>('/v1/display/closing-soon');

  return data.exhibitions;
};

// GET /v1/display/du-picks
export const getDuPicks = async (
  params: GetDuPicksRequestDto = {},
): Promise<GetDuPicksResponseDataDto> => apiRequest('/v1/display/du-picks', { query: params });

// GET /v1/display
export const getDisplays = async (
  params: GetDisplaysRequestDto = {},
): Promise<DisplayListResponseDataDto> => apiRequest('/v1/display', { query: params });

// GET /v1/display/search
export const searchDisplays = async (
  params: SearchDisplaysRequestDto,
): Promise<DisplayListResponseDataDto> => apiRequest('/v1/display/search', { query: params });

// GET /v1/display/map
export const getDisplayMap = async (
  params: GetDisplayMapRequestDto,
): Promise<GetDisplayMapResponseDataDto> => apiRequest('/v1/display/map', { query: params });

// GET /v1/display/:displayId
export const getDisplayDetail = async (displayId: number): Promise<DisplayDetailDto> =>
  apiRequest(`/v1/display/${displayId}`);

// GET /v1/display/:displayId/artworks
export const getDisplayArtworks = async (
  displayId: number,
  params: GetDisplayArtworksRequestDto,
): Promise<GetDisplayArtworksResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/artworks`, { query: params });

// POST /v1/display
export const createDisplay = async (
  body: CreateDisplayRequestDto,
): Promise<CreateDisplayResponseDataDto> => apiRequest('/v1/display', { method: 'POST', body });

// PATCH /v1/display/:displayId/details
export const updateDisplayDetails = async (
  displayId: number,
  body: UpdateDisplayDetailsRequestDto,
): Promise<UpdateDisplayDetailsResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/details`, { method: 'PATCH', body });

// POST /v1/display/:displayId/authors
export const createDisplayAuthor = async (
  displayId: number,
  body: CreateDisplayAuthorRequestDto,
): Promise<CreateDisplayAuthorResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/authors`, { method: 'POST', body });

// PATCH /v1/display/:displayId/visibility
export const updateDisplayVisibility = async (
  displayId: number,
  body: UpdateDisplayVisibilityRequestDto,
): Promise<UpdateDisplayVisibilityResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/visibility`, { method: 'PATCH', body });

// POST /v1/display/:displayId/publish
export const publishDisplay = async (displayId: number): Promise<PublishDisplayResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/publish`, { method: 'POST' });

// PATCH /v1/display/:displayId
export const updateDisplay = async (
  displayId: number,
  body: UpdateDisplayRequestDto,
): Promise<UpdateDisplayResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}`, { method: 'PATCH', body });

// DELETE /v1/display/:displayId
export const deleteDisplay = async (displayId: number): Promise<DeleteDisplayResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}`, { method: 'DELETE' });

// POST /v1/display/:displayId/like
export const toggleDisplayLike = async (
  displayId: number,
): Promise<ToggleDisplayLikeResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/like`, { method: 'POST' });

// GET /v1/display/:displayId/reviews
export const getDisplayReviews = async (
  displayId: number,
  params: { page: number; size: number },
): Promise<GetDisplayReviewsResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { query: params });

// POST /v1/display/:displayId/reviews
export const createDisplayReview = async (
  displayId: number,
  body: CreateDisplayReviewRequestDto,
): Promise<CreateDisplayReviewResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { method: 'POST', body });

// PATCH /v1/display/:displayId/reviews/:reviewId
export const updateDisplayReview = async (
  displayId: number,
  reviewId: number,
  body: UpdateDisplayReviewRequestDto,
): Promise<UpdateDisplayReviewResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${reviewId}`, { method: 'PATCH', body });

// DELETE /v1/display/:displayId/reviews/:reviewId
export const deleteDisplayReview = async (
  displayId: number,
  reviewId: number,
): Promise<DeleteDisplayReviewResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${reviewId}`, { method: 'DELETE' });
