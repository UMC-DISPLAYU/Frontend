import type {
  CreatePersonalArtworkFeelingRequestDto,
  CreatePersonalArtworkQuestionRequestDto,
  CreatePersonalArtworkReplyRequestDto,
  GetPersonalArtworkFeelingsResponseDataDto,
  GetPersonalArtworkQuestionReplyResponseDataDto,
  GetPersonalArtworkQuestionsResponseDataDto,
  GetPersonalArtworksResponseDataDto,
  PersonalArtworkFeelingLikeResponseDataDto,
  PersonalArtworkFeelingReplyLikeResponseDataDto,
  PersonalArtworkFeelingReplyListResponseDataDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkLikeResponseDataDto,
  PersonalArtworkQuestionLikeResponseDataDto,
  PersonalArtworkQuestionReplyLikeResponseDataDto,
  PersonalArtworkQuestionReplyResponseDataDto,
  PersonalArtworkQuestionResponseDataDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/personal-artworks
export const getPersonalArtworks = async (
  userId: number,
): Promise<GetPersonalArtworksResponseDataDto> =>
  apiRequest('/v1/personal-artworks', { query: { userId } });

// POST /v1/personal-artworks
export const createPersonalArtwork = async (
  body: PersonalArtworkRequestDto,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest('/v1/personal-artworks', { method: 'POST', body });

// GET /v1/personal-artworks/:personalArtworkId
export const getPersonalArtwork = async (
  personalArtworkId: number,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`);

// PATCH /v1/personal-artworks/:personalArtworkId
export const updatePersonalArtwork = async (
  personalArtworkId: number,
  body: Partial<PersonalArtworkRequestDto>,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`, { method: 'PATCH', body });

// DELETE /v1/personal-artworks/:personalArtworkId
export const deletePersonalArtwork = async (personalArtworkId: number): Promise<null> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`, { method: 'DELETE' });

// POST /v1/personal-artworks/:personalArtworkId/like
export const likePersonalArtwork = async (
  personalArtworkId: number,
): Promise<PersonalArtworkLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/like`, { method: 'POST' });

// DELETE /v1/personal-artworks/:personalArtworkId/like
export const unlikePersonalArtwork = async (
  personalArtworkId: number,
): Promise<PersonalArtworkLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/like`, { method: 'DELETE' });

// GET /v1/personal-artworks/:personalArtworkId/feelings
export const getPersonalArtworkFeelings = async (
  personalArtworkId: number,
): Promise<GetPersonalArtworkFeelingsResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings`);

// POST /v1/personal-artworks/:personalArtworkId/feelings
export const createPersonalArtworkFeeling = async (
  personalArtworkId: number,
  body: CreatePersonalArtworkFeelingRequestDto,
): Promise<PersonalArtworkFeelingResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings`, { method: 'POST', body });

// DELETE /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId
export const deletePersonalArtworkFeeling = async (
  personalArtworkId: number,
  personalFeelingId: number,
): Promise<unknown> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}`, {
    method: 'DELETE',
  });

// POST /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/like
export const likePersonalArtworkFeeling = async (
  personalArtworkId: number,
  personalFeelingId: number,
): Promise<PersonalArtworkFeelingLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/like`, {
    method: 'POST',
  });

// DELETE /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/like
export const unlikePersonalArtworkFeeling = async (
  personalArtworkId: number,
  personalFeelingId: number,
): Promise<PersonalArtworkFeelingLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/like`, {
    method: 'DELETE',
  });

// GET /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/replies
export const getPersonalArtworkFeelingReplies = async (
  personalArtworkId: number,
  personalFeelingId: number,
  params: { cursorId?: number; size?: number } = {},
): Promise<PersonalArtworkFeelingReplyListResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/replies`, {
    query: params,
  });

// POST /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/reply
export const createPersonalArtworkFeelingReply = async (
  personalArtworkId: number,
  personalFeelingId: number,
  body: CreatePersonalArtworkReplyRequestDto,
): Promise<unknown> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/reply`, {
    method: 'POST',
    body,
  });

// DELETE /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/reply/:personalFeelingReplyId
export const deletePersonalArtworkFeelingReply = async (
  personalArtworkId: number,
  personalFeelingId: number,
  personalFeelingReplyId: number,
): Promise<unknown> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/reply/${personalFeelingReplyId}`,
    { method: 'DELETE' },
  );

// POST /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/reply/:personalFeelingReplyId/like
export const likePersonalArtworkFeelingReply = async (
  personalArtworkId: number,
  personalFeelingId: number,
  personalFeelingReplyId: number,
): Promise<PersonalArtworkFeelingReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/reply/${personalFeelingReplyId}/like`,
    { method: 'POST' },
  );

// DELETE /v1/personal-artworks/:personalArtworkId/feelings/:personalFeelingId/reply/:personalFeelingReplyId/like
export const unlikePersonalArtworkFeelingReply = async (
  personalArtworkId: number,
  personalFeelingId: number,
  personalFeelingReplyId: number,
): Promise<PersonalArtworkFeelingReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/reply/${personalFeelingReplyId}/like`,
    { method: 'DELETE' },
  );

// GET /v1/personal-artworks/:personalArtworkId/questions
export const getPersonalArtworkQuestions = async (
  personalArtworkId: number,
): Promise<GetPersonalArtworkQuestionsResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions`);

// POST /v1/personal-artworks/:personalArtworkId/questions
export const createPersonalArtworkQuestion = async (
  personalArtworkId: number,
  body: CreatePersonalArtworkQuestionRequestDto,
): Promise<PersonalArtworkQuestionResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions`, { method: 'POST', body });

// DELETE /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId
export const deletePersonalArtworkQuestion = async (
  personalArtworkId: number,
  personalQuestionId: number,
): Promise<unknown> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}`, {
    method: 'DELETE',
  });

// POST /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId/like
export const togglePersonalArtworkQuestionLike = async (
  personalArtworkId: number,
  personalQuestionId: number,
): Promise<PersonalArtworkQuestionLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}/like`, {
    method: 'POST',
  });

// POST /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId/reply
export const createPersonalArtworkQuestionReply = async (
  personalArtworkId: number,
  personalQuestionId: number,
  body: CreatePersonalArtworkReplyRequestDto,
): Promise<PersonalArtworkQuestionReplyResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}/reply`, {
    method: 'POST',
    body,
  });

// GET /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId/reply
export const getPersonalArtworkQuestionReply = async (
  personalArtworkId: number,
  personalQuestionId: number,
): Promise<GetPersonalArtworkQuestionReplyResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}/reply`);

// DELETE /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId/reply/:personalQuestionReplyId
export const deletePersonalArtworkQuestionReply = async (
  personalArtworkId: number,
  personalQuestionId: number,
  personalQuestionReplyId: number,
): Promise<unknown> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}/reply/${personalQuestionReplyId}`,
    { method: 'DELETE' },
  );

// POST /v1/personal-artworks/:personalArtworkId/questions/:personalQuestionId/reply/:personalQuestionReplyId/like
export const togglePersonalArtworkQuestionReplyLike = async (
  personalArtworkId: number,
  personalQuestionId: number,
  personalQuestionReplyId: number,
): Promise<PersonalArtworkQuestionReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/questions/${personalQuestionId}/reply/${personalQuestionReplyId}/like`,
    { method: 'POST' },
  );
