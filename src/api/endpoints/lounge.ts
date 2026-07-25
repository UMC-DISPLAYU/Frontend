import type {
  CreateLoungeCommentRequestDto,
  CreateLoungeCommentResponseDataDto,
  CreateLoungePostRequestDto,
  CreateLoungePostResponseDataDto,
  CreateLoungeReplyRequestDto,
  CreateLoungeReplyResponseDataDto,
  DeleteLoungeCommentResponseDataDto,
  DeleteLoungePostResponseDataDto,
  GetLoungeCommentsResponseDataDto,
  GetLoungePostsRequestDto,
  GetLoungePostsResponseDataDto,
  GetLoungeRepliesResponseDataDto,
  LoungeCommentLikeStatusDto,
  LoungePostDetailDto,
  LoungePostLikeStatusDto,
  LoungePostScrapStatusDto,
  UpdateLoungeCommentRequestDto,
  UpdateLoungeCommentResponseDataDto,
  UpdateLoungePostRequestDto,
  UpdateLoungePostResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/lounge/posts
export const createLoungePost = async (
  body: CreateLoungePostRequestDto,
): Promise<CreateLoungePostResponseDataDto> =>
  apiRequest('/v1/lounge/posts', { method: 'POST', body });

// GET /v1/lounge/posts
export const getLoungePosts = async (
  params: GetLoungePostsRequestDto = {},
): Promise<GetLoungePostsResponseDataDto> => apiRequest('/v1/lounge/posts', { query: params });

// GET /v1/lounge/posts/:postId
export const getLoungePostDetail = async (postId: number): Promise<LoungePostDetailDto> =>
  apiRequest(`/v1/lounge/posts/${postId}`);

// PATCH /v1/lounge/posts/:postId
export const updateLoungePost = async (
  postId: number,
  body: UpdateLoungePostRequestDto,
): Promise<UpdateLoungePostResponseDataDto> =>
  apiRequest(`/v1/lounge/posts/${postId}`, { method: 'PATCH', body });

// DELETE /v1/lounge/posts/:postId
export const deleteLoungePost = async (postId: number): Promise<DeleteLoungePostResponseDataDto> =>
  apiRequest(`/v1/lounge/posts/${postId}`, { method: 'DELETE' });

// POST /v1/lounge/posts/:postId/comments
export const createLoungeComment = async (
  postId: number,
  body: CreateLoungeCommentRequestDto,
): Promise<CreateLoungeCommentResponseDataDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/comments`, { method: 'POST', body });

// GET /v1/lounge/posts/:postId/comments
export const getLoungeComments = async (
  postId: number,
  params: { cursorId?: number | null; size?: number } = {},
): Promise<GetLoungeCommentsResponseDataDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/comments`, { query: params });

// PATCH /v1/lounge/comments/:commentId
export const updateLoungeComment = async (
  commentId: number,
  body: UpdateLoungeCommentRequestDto,
): Promise<UpdateLoungeCommentResponseDataDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}`, { method: 'PATCH', body });

// DELETE /v1/lounge/comments/:commentId
export const deleteLoungeComment = async (
  commentId: number,
): Promise<DeleteLoungeCommentResponseDataDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}`, { method: 'DELETE' });

// POST /v1/lounge/posts/:postId/likes
export const likeLoungePost = async (postId: number): Promise<LoungePostLikeStatusDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/likes`, { method: 'POST' });

// DELETE /v1/lounge/posts/:postId/likes
export const unlikeLoungePost = async (postId: number): Promise<LoungePostLikeStatusDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/likes`, { method: 'DELETE' });

// POST /v1/lounge/comments/:commentId/likes
export const likeLoungeComment = async (commentId: number): Promise<LoungeCommentLikeStatusDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}/likes`, { method: 'POST' });

// DELETE /v1/lounge/comments/:commentId/likes
export const unlikeLoungeComment = async (commentId: number): Promise<LoungeCommentLikeStatusDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}/likes`, { method: 'DELETE' });

// POST /v1/lounge/posts/:postId/scraps
export const scrapLoungePost = async (postId: number): Promise<LoungePostScrapStatusDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/scraps`, { method: 'POST' });

// DELETE /v1/lounge/posts/:postId/scraps
export const unscrapLoungePost = async (postId: number): Promise<LoungePostScrapStatusDto> =>
  apiRequest(`/v1/lounge/posts/${postId}/scraps`, { method: 'DELETE' });

// POST /v1/lounge/comments/:commentId/replies
export const createLoungeReply = async (
  commentId: number,
  body: CreateLoungeReplyRequestDto,
): Promise<CreateLoungeReplyResponseDataDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}/replies`, { method: 'POST', body });

// GET /v1/lounge/comments/:commentId/replies
export const getLoungeReplies = async (
  commentId: number,
  params: { cursorId?: number | null; size?: number } = {},
): Promise<GetLoungeRepliesResponseDataDto> =>
  apiRequest(`/v1/lounge/comments/${commentId}/replies`, { query: params });
