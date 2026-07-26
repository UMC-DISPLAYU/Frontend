import type {
  GetDisplayReviewRepliesResponseDataDto,
  GetDisplayReviewsResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/display/:displayId/reviews
export const getDisplayReviews = async (
  displayId: number,
  params: { cursorId?: number | null; size?: number } = {},
): Promise<GetDisplayReviewsResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { query: params });

// GET /v1/display/:displayId/reviews/:displayReviewId/replies
export const getDisplayReviewReplies = async (
  displayId: number,
  displayReviewId: number,
  params: { cursorId?: number | null; size?: number } = {},
): Promise<GetDisplayReviewRepliesResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/replies`, { query: params });
