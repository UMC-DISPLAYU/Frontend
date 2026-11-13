import type {
  CreatePersonalArtworkFeelingRequestDto,
  CreatePersonalArtworkReplyRequestDto,
  GetPersonalArtworkFeelingsResponseDataDto,
  GetPersonalArtworksResponseDataDto,
  PersonalArtworkFeelingLikeResponseDataDto,
  PersonalArtworkFeelingReplyLikeResponseDataDto,
  PersonalArtworkFeelingReplyListResponseDataDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkLikeResponseDataDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/personal-artworks
export const getPersonalArtworks = async (
  userId: number,
): Promise<GetPersonalArtworksResponseDataDto> =>
  apiRequest('/v1/personal-artworks', { query: { userId } });

// GET /v1/personal-artworks/:personalArtworkId
export const getPersonalArtwork = async (
  personalArtworkId: number,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`);

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
