import type {
  ArtworkFeelingLikeDto,
  ArtworkQuestionRecordDto,
  CreateArtworkFeelingRequestDto,
  CreateArtworkFeelingResponseDataDto,
  CreateArtworkQuestionReplyRequestDto,
  CreateArtworkQuestionReplyResponseDataDto,
  CreateArtworkQuestionRequestDto,
  CreateExhibitionArtworkRequestDto,
  CreateExhibitionArtworkResponseDataDto,
  DeleteArtworkQuestionResponseDataDto,
  DeleteArtworkResponseDataDto,
  GetArtworkDetailResponseDataDto,
  GetArtworkFeelingsResponseDataDto,
  GetArtworkPreviewRequestDto,
  GetArtworkPreviewResponseDataDto,
  GetArtworkQuestionsResponseDataDto,
  SetupArtworkAuthorRequestDto,
  SetupArtworkAuthorResponseDataDto,
  UpdateArtworkFeelingRequestDto,
  UpdateArtworkFeelingResponseDataDto,
  UpdateArtworkOrderRequestDto,
  UpdateArtworkOrderResponseDataDto,
  UpdateArtworkQuestionRequestDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/display-artwork/:artworkId
export const getArtworkDetail = async (
  artworkId: number,
): Promise<GetArtworkDetailResponseDataDto> => apiRequest(`/v1/display-artwork/${artworkId}`);

// GET /v1/display-artwork/:artworkId/feelings
export const getArtworkFeelings = async (
  artworkId: number,
): Promise<GetArtworkFeelingsResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/feelings`);

// POST /v1/display-artwork/:artworkId/feelings
export const createArtworkFeeling = async (
  artworkId: number,
  body: CreateArtworkFeelingRequestDto,
): Promise<CreateArtworkFeelingResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/feelings`, { method: 'POST', body });

// PATCH /v1/display-artwork/:artworkId/feelings/:feelingId
export const updateArtworkFeeling = async (
  artworkId: number,
  feelingId: number,
  body: UpdateArtworkFeelingRequestDto,
): Promise<UpdateArtworkFeelingResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/feelings/${feelingId}`, { method: 'PATCH', body });

// DELETE /v1/display-artwork/:artworkId/feelings/:feelingId
export const deleteArtworkFeeling = async (artworkId: number, feelingId: number): Promise<null> =>
  apiRequest(`/v1/display-artwork/${artworkId}/feelings/${feelingId}`, { method: 'DELETE' });

// GET /v1/display-artwork/:artworkId/questions
export const getArtworkQuestions = async (
  artworkId: number,
): Promise<GetArtworkQuestionsResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/questions`);

// POST /v1/display-artwork/:artworkId/questions
export const createArtworkQuestion = async (
  artworkId: number,
  body: CreateArtworkQuestionRequestDto,
): Promise<ArtworkQuestionRecordDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/questions`, { method: 'POST', body });

// PATCH /v1/display-artwork/:artworkId/questions/:questionId
export const updateArtworkQuestion = async (
  artworkId: number,
  questionId: number,
  body: UpdateArtworkQuestionRequestDto,
): Promise<ArtworkQuestionRecordDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/questions/${questionId}`, { method: 'PATCH', body });

// DELETE /v1/display-artwork/:artworkId/questions/:questionId
export const deleteArtworkQuestion = async (
  artworkId: number,
  questionId: number,
): Promise<DeleteArtworkQuestionResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/questions/${questionId}`, { method: 'DELETE' });

// POST /v1/display-artwork/:artworkId/questions/:questionId/replies
export const createArtworkQuestionReply = async (
  artworkId: number,
  questionId: number,
  body: CreateArtworkQuestionReplyRequestDto,
): Promise<CreateArtworkQuestionReplyResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/questions/${questionId}/replies`, {
    method: 'POST',
    body,
  });

// POST /v1/display-artwork/:artworkId/feelings/:feelingId/like
export const toggleArtworkFeelingLike = async (
  artworkId: number,
  feelingId: number,
): Promise<ArtworkFeelingLikeDto | null> =>
  apiRequest(`/v1/display-artwork/${artworkId}/feelings/${feelingId}/like`, { method: 'POST' });

// PATCH /v1/display/:displayId/artworks/order
export const updateArtworkOrder = async (
  displayId: number,
  body: UpdateArtworkOrderRequestDto,
): Promise<UpdateArtworkOrderResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/artworks/order`, { method: 'PATCH', body });

// POST /v1/display/:displayId/artworks
export const createExhibitionArtwork = async (
  displayId: number,
  body: CreateExhibitionArtworkRequestDto,
): Promise<CreateExhibitionArtworkResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/artworks`, { method: 'POST', body });

// PATCH /v1/display-artwork/:artworkId/author
export const setupArtworkAuthor = async (
  artworkId: number,
  body: SetupArtworkAuthorRequestDto,
): Promise<SetupArtworkAuthorResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}/author`, { method: 'PATCH', body });

// DELETE /v1/display-artwork/:artworkId
export const deleteArtwork = async (artworkId: number): Promise<DeleteArtworkResponseDataDto> =>
  apiRequest(`/v1/display-artwork/${artworkId}`, { method: 'DELETE' });

// GET /v1/display-artwork/preview
export const getArtworkPreview = async (
  params: GetArtworkPreviewRequestDto = {},
): Promise<GetArtworkPreviewResponseDataDto> =>
  apiRequest('/v1/artworks/preview', { query: params });
