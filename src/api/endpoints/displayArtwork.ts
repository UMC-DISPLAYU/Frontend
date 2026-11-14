import type {
  ArtworkFeelingLikeDto,
  ArtworkFeelingReplyImageRequestDto,
  ArtworkFeelingReplyLikeDto,
  ArtworkFeelingReplyListResponseDataDto,
  CreateArtworkFeelingReplyResponseDataDto,
  CreateArtworkFeelingRequestDto,
  CreateArtworkFeelingResponseDataDto,
  CreateExhibitionArtworkRequestDto,
  CreateExhibitionArtworkResponseDataDto,
  DeleteArtworkFeelingReplyResponseDataDto,
  DeleteArtworkResponseDataDto,
  DisplayArtworkEditResponseDataDto,
  GetArtworkDetailResponseDataDto,
  GetArtworkFeelingsRequestDto,
  GetArtworkFeelingsResponseDataDto,
  GetArtworkPreviewRequestDto,
  GetArtworkPreviewResponseDataDto,
  GetDisplayArtworksResponseDataDto,
  GetMyArtworkFeelingsResponseDataDto,
  SearchArtworksRequestDto,
  SearchArtworksResponseDataDto,
  UpdateArtworkFeelingRequestDto,
  UpdateArtworkFeelingResponseDataDto,
  UpdateArtworkOrderRequestDto,
  UpdateArtworkOrderResponseDataDto,
  UpdateExhibitionArtworkRequestDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/artworks/:artworkId
export const getArtworkDetail = async (
  artworkId: number,
): Promise<GetArtworkDetailResponseDataDto> => apiRequest(`/v1/artworks/${artworkId}`);

// GET /v1/artworks/:artworkId/edit
export const getArtworkForEdit = async (
  artworkId: number,
): Promise<DisplayArtworkEditResponseDataDto> => apiRequest(`/v1/artworks/${artworkId}/edit`);

// GET /v1/artworks/:artworkId/feelings
export const getArtworkFeelings = async (
  artworkId: number,
  params: GetArtworkFeelingsRequestDto = {},
): Promise<GetArtworkFeelingsResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings`, { query: params });

// POST /v1/artworks/:artworkId/feelings
export const createArtworkFeeling = async (
  artworkId: number,
  body: CreateArtworkFeelingRequestDto,
): Promise<CreateArtworkFeelingResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings`, { method: 'POST', body });

// PATCH /v1/artworks/:artworkId/feelings/:feelingId
export const updateArtworkFeeling = async (
  artworkId: number,
  feelingId: number,
  body: UpdateArtworkFeelingRequestDto,
): Promise<UpdateArtworkFeelingResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}`, { method: 'PATCH', body });

// DELETE /v1/artworks/:artworkId/feelings/:feelingId
export const deleteArtworkFeeling = async (artworkId: number, feelingId: number): Promise<null> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}`, { method: 'DELETE' });

// GET /api/v1/artworks/feelings/me
export const getMyArtworkFeelings = async (
  params: {
    cursor?: string;
    size?: number;
  } = {},
): Promise<GetMyArtworkFeelingsResponseDataDto> =>
  apiRequest('/v1/artworks/feelings/me', { query: params });

// POST /v1/artworks/:artworkId/feelings/:feelingId/like
export const likeArtworkFeeling = async (
  artworkId: number,
  feelingId: number,
): Promise<ArtworkFeelingLikeDto | null> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/like`, { method: 'POST' });

// DELETE /v1/artworks/:artworkId/feelings/:feelingId/like
export const unlikeArtworkFeeling = async (
  artworkId: number,
  feelingId: number,
): Promise<ArtworkFeelingLikeDto | null> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/like`, { method: 'DELETE' });

// GET /v1/artworks/:artworkId/feelings/:feelingId/replies
export const getArtworkFeelingReplies = async (
  artworkId: number,
  feelingId: number,
  params: { cursorId?: number; size?: number } = {},
): Promise<ArtworkFeelingReplyListResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/replies`, { query: params });

// PUT /v1/artworks/order
export const updateArtworkOrder = async (
  _displayId: number,
  body: UpdateArtworkOrderRequestDto,
): Promise<UpdateArtworkOrderResponseDataDto> =>
  apiRequest('/v1/artworks/order', { method: 'PUT', body });

// POST /v1/artworks
export const createExhibitionArtwork = async (
  _displayId: number,
  body: CreateExhibitionArtworkRequestDto,
): Promise<CreateExhibitionArtworkResponseDataDto> =>
  apiRequest('/v1/artworks', { method: 'POST', body });

// PATCH /v1/artworks/:artworkId
export const updateExhibitionArtwork = async (
  artworkId: number,
  body: UpdateExhibitionArtworkRequestDto,
): Promise<CreateExhibitionArtworkResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}`, { method: 'PATCH', body });

// DELETE /v1/artworks/:artworkId
export const deleteArtwork = async (artworkId: number): Promise<DeleteArtworkResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}`, { method: 'DELETE' });

// GET /v1/artworks/preview
export const getArtworkPreview = async (
  params: GetArtworkPreviewRequestDto = {},
): Promise<GetArtworkPreviewResponseDataDto> =>
  apiRequest('/v1/artworks/preview', { query: params });

// GET /v1/artworks/search
export const searchArtworks = async (
  params: SearchArtworksRequestDto,
  signal?: AbortSignal,
): Promise<SearchArtworksResponseDataDto> =>
  apiRequest('/v1/artworks/search', { query: params, signal });

// POST /v1/artworks/:artworkId/feelings/:feelingId/reply
export const createArtworkFeelingReply = async (
  artworkId: number,
  feelingId: number,
  body: { content: string; images?: ArtworkFeelingReplyImageRequestDto[] },
): Promise<CreateArtworkFeelingReplyResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/reply`, { method: 'POST', body });

// DELETE /v1/artworks/:artworkId/feelings/:feelingId/reply/:feelingReplyId
export const deleteArtworkFeelingReply = async (
  artworkId: number,
  feelingId: number,
  feelingReplyId: number,
): Promise<DeleteArtworkFeelingReplyResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/reply/${feelingReplyId}`, {
    method: 'DELETE',
  });

// POST /v1/artworks/:artworkId/feelings/:feelingId/reply/:feelingReplyId/like
export const likeArtworkFeelingReply = async (
  artworkId: number,
  feelingId: number,
  feelingReplyId: number,
): Promise<ArtworkFeelingReplyLikeDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/reply/${feelingReplyId}/like`, {
    method: 'POST',
  });

// DELETE /v1/artworks/:artworkId/feelings/:feelingId/reply/:feelingReplyId/like
export const unlikeArtworkFeelingReply = async (
  artworkId: number,
  feelingId: number,
  feelingReplyId: number,
): Promise<ArtworkFeelingReplyLikeDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/reply/${feelingReplyId}/like`, {
    method: 'DELETE',
  });

// POST /v1/artworks/:artworkId/like
export const likeArtwork = async (artworkId: number): Promise<unknown> =>
  apiRequest(`/v1/artworks/${artworkId}/like`, { method: 'POST' });

// DELETE /v1/artworks/:artworkId/like
export const unlikeArtwork = async (artworkId: number): Promise<unknown> =>
  apiRequest(`/v1/artworks/${artworkId}/like`, { method: 'DELETE' });

// GET /v1/artworks?displayId=:displayId
export const getDisplayArtworks = async (
  displayId: number,
): Promise<GetDisplayArtworksResponseDataDto> =>
  apiRequest('/v1/artworks', { query: { displayId } });

// GET /v1/artworks?userId=:userId - 작가 프로필의 작품 탭 (전시에 등록한 작품 전체)
export const getArtistArtworks = async (
  userId: number,
): Promise<GetDisplayArtworksResponseDataDto> => apiRequest('/v1/artworks', { query: { userId } });

// 삭제됨: 개인 작품 API(GET /v1/personal-artworks)로 대체되었습니다.
