import type {
  CreateDisplayRequestDto,
  CreateDisplayResponseDataDto,
  DisplayDetailDto,
  DisplayListResponseDataDto,
  GetClosingSoonDisplaysRequestDto,
  GetClosingSoonDisplaysResponseDataDto,
  GetDisplayMapRequestDto,
  GetDisplayMapResponseDataDto,
  GetDisplayReviewRepliesRequestDto,
  GetDisplayReviewRepliesResponseDataDto,
  GetDisplayReviewsRequestDto,
  GetDisplayReviewsResponseDataDto,
  GetDuPicksRequestDto,
  GetDuPicksResponseDataDto,
  HomeExhibitionDto,
  SearchDisplaysRequestDto,
  ToggleDisplayLikeResponseDataDto,
  UpdateDisplayRequestDto,
  UpdateDisplayResponseDataDto,
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
export const getClosingSoonDisplays = async (
  params: GetClosingSoonDisplaysRequestDto = {},
): Promise<GetClosingSoonDisplaysResponseDataDto> =>
  apiRequest<GetClosingSoonDisplaysResponseDataDto>('/v1/display/closing-soon', {
    query: params,
  });

// GET /v1/display/du-picks
export const getDuPicks = async (
  params: GetDuPicksRequestDto = {},
): Promise<GetDuPicksResponseDataDto> => apiRequest('/v1/display/du-picks', { query: params });

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

// POST /v1/display
export const createDisplay = async (
  body: CreateDisplayRequestDto,
): Promise<CreateDisplayResponseDataDto> => apiRequest('/v1/display', { method: 'POST', body });

// PATCH /v1/display
export const updateDisplay = async (
  displayId: number,
  body: UpdateDisplayRequestDto,
): Promise<UpdateDisplayResponseDataDto> =>
  apiRequest('/v1/display', { method: 'PATCH', body: { displayId, ...body } });

// POST /v1/display/like
export const toggleDisplayLike = async (
  displayId: number,
): Promise<ToggleDisplayLikeResponseDataDto> =>
  apiRequest('/v1/display/like', { method: 'POST', body: { displayId } });

// PATCH /v1/display/like
export const updateDisplayLike = async (body: {
  displayId: number;
  userId?: number;
}): Promise<ToggleDisplayLikeResponseDataDto> =>
  apiRequest('/v1/display/like', { method: 'PATCH', body });

// GET /v1/display/:displayId/reviews
export const getDisplayReviews = async (
  displayId: number,
  params: GetDisplayReviewsRequestDto = {},
): Promise<GetDisplayReviewsResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { query: params });

// GET /v1/display/:displayId/reviews/:displayReviewId/replies
export const getDisplayReviewReplies = async (
  displayId: number,
  displayReviewId: number,
  params: GetDisplayReviewRepliesRequestDto = {},
): Promise<GetDisplayReviewRepliesResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/replies`, { query: params });
