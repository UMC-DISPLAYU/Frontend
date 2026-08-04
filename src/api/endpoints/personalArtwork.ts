import type {
  CreatePersonalArtworkFeelingRequestDto,
  CreatePersonalArtworkQuestionRequestDto,
  CreatePersonalArtworkReplyRequestDto,
  GetPersonalArtworkFeelingsResponseDataDto,
  GetPersonalArtworkQuestionsResponseDataDto,
  GetPersonalArtworksResponseDataDto,
  PersonalArtworkFeelingLikeResponseDataDto,
  PersonalArtworkFeelingReplyLikeResponseDataDto,
  PersonalArtworkFeelingReplyListResponseDataDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkLikeResponseDataDto,
  PersonalArtworkQuestionReplyResponseDataDto,
  PersonalArtworkQuestionResponseDataDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/personal-artworks
export const getPersonalArtworks = async (): Promise<GetPersonalArtworksResponseDataDto> =>
  apiRequest('/v1/personal-artworks');

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
export const togglePersonalArtworkFeelingLike = async (
  personalArtworkId: number,
  personalFeelingId: number,
): Promise<PersonalArtworkFeelingLikeResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/like`, {
    method: 'POST',
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
export const togglePersonalArtworkFeelingReplyLike = async (
  personalArtworkId: number,
  personalFeelingId: number,
  personalFeelingReplyId: number,
): Promise<PersonalArtworkFeelingReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/personal-artworks/${personalArtworkId}/feelings/${personalFeelingId}/reply/${personalFeelingReplyId}/like`,
    { method: 'POST' },
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
