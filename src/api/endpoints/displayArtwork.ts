import type {
  ArtworkFeelingLikeDto,
  ArtworkFeelingReplyLikeDto,
  ArtworkFeelingReplyListResponseDataDto,
  ArtworkQuestionRecordDto,
  CreateArtworkFeelingRequestDto,
  CreateArtworkFeelingResponseDataDto,
  CreateArtworkQuestionReplyRequestDto,
  CreateArtworkQuestionReplyResponseDataDto,
  CreateArtworkQuestionRequestDto,
  CreateExhibitionArtworkRequestDto,
  CreateExhibitionArtworkResponseDataDto,
  DeleteArtworkFeelingReplyResponseDataDto,
  DeleteArtworkQuestionResponseDataDto,
  DeleteArtworkResponseDataDto,
  GetArtworkDetailResponseDataDto,
  GetArtworkFeelingsResponseDataDto,
  GetArtworkPreviewRequestDto,
  GetArtworkPreviewResponseDataDto,
  GetArtworkQuestionsResponseDataDto,
  GetDisplayArtworksResponseDataDto,
  GetMyArtworkQuestionsResponseDataDto,
  UpdateArtworkFeelingRequestDto,
  UpdateArtworkFeelingResponseDataDto,
  UpdateArtworkOrderRequestDto,
  UpdateArtworkOrderResponseDataDto,
  UpdateArtworkQuestionRequestDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/artworks/:artworkId
export const getArtworkDetail = async (
  artworkId: number,
): Promise<GetArtworkDetailResponseDataDto> => apiRequest(`/v1/artworks/${artworkId}`);

// GET /v1/artworks/:artworkId/feelings
export const getArtworkFeelings = async (
  artworkId: number,
): Promise<GetArtworkFeelingsResponseDataDto> => apiRequest(`/v1/artworks/${artworkId}/feelings`);

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

// GET /v1/artworks/:artworkId/questions
export const getArtworkQuestions = async (
  artworkId: number,
): Promise<GetArtworkQuestionsResponseDataDto> => apiRequest(`/v1/artworks/${artworkId}/questions`);

// 가짜 엔드포인트: 백엔드에 내 작품 질문 조회 API가 생기기 전까지 답변할 질문 화면에서 사용합니다.
// GET /api/v1/artworks/question/me
export const getMyArtworkQuestions = async (): Promise<GetMyArtworkQuestionsResponseDataDto> =>
  apiRequest('/v1/artworks/question/me');

// POST /v1/artworks/:artworkId/questions
export const createArtworkQuestion = async (
  artworkId: number,
  body: CreateArtworkQuestionRequestDto,
): Promise<ArtworkQuestionRecordDto> =>
  apiRequest(`/v1/artworks/${artworkId}/questions`, { method: 'POST', body });

// PATCH /v1/artworks/:artworkId/questions/:questionId
export const updateArtworkQuestion = async (
  artworkId: number,
  questionId: number,
  body: UpdateArtworkQuestionRequestDto,
): Promise<ArtworkQuestionRecordDto> =>
  apiRequest(`/v1/artworks/${artworkId}/questions/${questionId}`, { method: 'PATCH', body });

// DELETE /v1/artworks/:artworkId/questions/:questionId
export const deleteArtworkQuestion = async (
  artworkId: number,
  questionId: number,
): Promise<DeleteArtworkQuestionResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/questions/${questionId}`, { method: 'DELETE' });

// POST /v1/artworks/:artworkId/questions/:questionId/reply
export const createArtworkQuestionReply = async (
  artworkId: number,
  questionId: number,
  body: CreateArtworkQuestionReplyRequestDto,
): Promise<CreateArtworkQuestionReplyResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}/questions/${questionId}/reply`, {
    method: 'POST',
    body,
  });

// POST /v1/artworks/:artworkId/feelings/:feelingId/like
export const toggleArtworkFeelingLike = async (
  artworkId: number,
  feelingId: number,
): Promise<ArtworkFeelingLikeDto | null> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/like`, { method: 'POST' });

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

// DELETE /v1/artworks/:artworkId
export const deleteArtwork = async (artworkId: number): Promise<DeleteArtworkResponseDataDto> =>
  apiRequest(`/v1/artworks/${artworkId}`, { method: 'DELETE' });

// GET /v1/artworks/preview
export const getArtworkPreview = async (
  params: GetArtworkPreviewRequestDto = {},
): Promise<GetArtworkPreviewResponseDataDto> =>
  apiRequest('/v1/artworks/preview', { query: params });

// POST /v1/artworks/:artworkId/feelings/:feelingId/reply
export const createArtworkFeelingReply = async (
  artworkId: number,
  feelingId: number,
  body: { content: string },
): Promise<unknown> =>
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
export const toggleArtworkFeelingReplyLike = async (
  artworkId: number,
  feelingId: number,
  feelingReplyId: number,
): Promise<ArtworkFeelingReplyLikeDto> =>
  apiRequest(`/v1/artworks/${artworkId}/feelings/${feelingId}/reply/${feelingReplyId}/like`, {
    method: 'POST',
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

// 삭제됨: 개인 작품 API(GET /v1/personal-artworks)로 대체되었습니다.
