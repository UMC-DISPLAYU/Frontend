import type {
  ClosingSoonExhibitionDto,
  CreateDisplayRequestDto,
  CreateDisplayResponseDataDto,
  DisplayDetailDto,
  DisplayListResponseDataDto,
  GetClosingSoonDisplaysResponseDataDto,
  GetDisplayMapRequestDto,
  GetDisplayMapResponseDataDto,
  GetDuPicksResponseDataDto,
  HomeExhibitionDto,
  SearchDisplaysRequestDto,
  ToggleDisplayLikeResponseDataDto,
  UpdateDisplayRequestDto,
  UpdateDisplayResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/display/graduation
export const getGraduationDisplays = async (): Promise<HomeExhibitionDto[]> => {
  const data = await apiRequest<{ exhibitions: HomeExhibitionDto[] }>('/v1/display/graduation');

  return data.exhibitions;
};

// GET /v1/display/closing-soon
export const getClosingSoonDisplays = async (): Promise<ClosingSoonExhibitionDto[]> => {
  const data = await apiRequest<GetClosingSoonDisplaysResponseDataDto>('/v1/display/closing-soon');

  return data.exhibitions;
};

// GET /v1/display/du-picks
export const getDuPicks = async (): Promise<GetDuPicksResponseDataDto> =>
  apiRequest('/v1/display/du-picks');

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
