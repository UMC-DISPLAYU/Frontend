import type {
  CreateDisplayRequestDto,
  CreateDisplayResponseDataDto,
  CreateDisplayReviewReplyRequestDto,
  CreateDisplayReviewReplyResponseDataDto,
  CreateDisplayReviewRequestDto,
  CreateDisplayReviewResponseDataDto,
  DeleteDisplayReviewReplyResponseDataDto,
  DeleteDisplayReviewResponseDataDto,
  DisplayDetailDto,
  DisplayListResponseDataDto,
  DisplayMemberInvitationResponseDataDto,
  DisplayMemberListResponseDataDto,
  DisplayReviewLikeResponseDataDto,
  DisplayReviewReplyLikeResponseDataDto,
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
  GetMyDisplaysResponseDataDto,
  GetOpenTimeResponseDataDto,
  HomeExhibitionDto,
  InviteDisplayMemberRequestDto,
  MyDisplayInvitationListResponseDataDto,
  SearchDisplaysRequestDto,
  ToggleDisplayLikeResponseDataDto,
  UpdateDisplayRequestDto,
  UpdateDisplayResponseDataDto,
  UpdateOpenTimeRequestDto,
  UpdateOpenTimeResponseDataDto,
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

// 가짜 엔드포인트: 백엔드에 공개 시점 설정 API가 생기면 실제 경로로 교체해야 합니다.
// GET /v1/open-time/{displayId}
export const getOpenTime = async (displayId: number): Promise<GetOpenTimeResponseDataDto> =>
  apiRequest(`/v1/open-time/${displayId}`);

// 가짜 엔드포인트: 백엔드에 공개 시점 설정 API가 생기면 실제 경로로 교체해야 합니다.
// PATCH /v1/open-time/{displayId}
export const updateOpenTime = async (
  displayId: number,
  body: UpdateOpenTimeRequestDto,
): Promise<UpdateOpenTimeResponseDataDto> =>
  apiRequest(`/v1/open-time/${displayId}`, { method: 'PATCH', body });

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

// GET /v1/display/me
export const getMyDisplays = async (): Promise<GetMyDisplaysResponseDataDto> =>
  apiRequest('/v1/display/me');

// PATCH /v1/display/me/nickname
export const updateMyDisplayNickname = async (body: { nickname: string }): Promise<unknown> =>
  apiRequest('/v1/display/me/nickname', { method: 'PATCH', body });

// GET /v1/display/invitation/:token
export const getDisplayInvitationByToken = async (
  token: string,
): Promise<DisplayMemberInvitationResponseDataDto> => apiRequest(`/v1/display/invitation/${token}`);

// POST /v1/display/:displayId/invitation
export const createDisplayInvitation = async (
  displayId: number,
): Promise<DisplayMemberInvitationResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/invitation`, { method: 'POST' });

// PATCH /v1/display/:displayId/invitation/disable
export const disableDisplayInvitation = async (displayId: number): Promise<unknown> =>
  apiRequest(`/v1/display/${displayId}/invitation/disable`, { method: 'PATCH' });

// GET /v1/display/:displayId/members
export const getDisplayMembers = async (
  displayId: number,
): Promise<DisplayMemberListResponseDataDto> => apiRequest(`/v1/display/${displayId}/members`);

// POST /v1/display-invitations/displays/:displayId
export const inviteDisplayMember = async (
  displayId: number,
  body: InviteDisplayMemberRequestDto,
): Promise<DisplayMemberInvitationResponseDataDto> =>
  apiRequest(`/v1/display-invitations/displays/${displayId}`, { method: 'POST', body });

// GET /v1/display-invitations/me
export const getMyDisplayInvitations = async (): Promise<MyDisplayInvitationListResponseDataDto> =>
  apiRequest('/v1/display-invitations/me');

// POST /v1/display-invitations/:invitationId/accept
export const acceptDisplayInvitation = async (
  invitationId: number,
  body: { displayNickname: string },
): Promise<DisplayMemberInvitationResponseDataDto> =>
  apiRequest(`/v1/display-invitations/${invitationId}/accept`, { method: 'POST', body });

// POST /v1/display-invitations/:invitationId/reject
export const rejectDisplayInvitation = async (
  invitationId: number,
): Promise<DisplayMemberInvitationResponseDataDto> =>
  apiRequest(`/v1/display-invitations/${invitationId}/reject`, { method: 'POST' });

// GET /v1/display/:displayId/reviews
export const getDisplayReviews = async (
  displayId: number,
  params: GetDisplayReviewsRequestDto = {},
): Promise<GetDisplayReviewsResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { query: params });

// POST /v1/display/:displayId/reviews
export const createDisplayReview = async (
  displayId: number,
  body: CreateDisplayReviewRequestDto,
): Promise<CreateDisplayReviewResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews`, { method: 'POST', body });

// DELETE /v1/display/:displayId/reviews/:displayReviewId
export const deleteDisplayReview = async (
  displayId: number,
  displayReviewId: number,
): Promise<DeleteDisplayReviewResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}`, { method: 'DELETE' });

// POST /v1/display/:displayId/reviews/:displayReviewId/like
export const toggleDisplayReviewLike = async (
  displayId: number,
  displayReviewId: number,
): Promise<DisplayReviewLikeResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/like`, { method: 'POST' });

// GET /v1/display/:displayId/reviews/:displayReviewId/replies
export const getDisplayReviewReplies = async (
  displayId: number,
  displayReviewId: number,
  params: GetDisplayReviewRepliesRequestDto = {},
): Promise<GetDisplayReviewRepliesResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/replies`, { query: params });

// POST /v1/display/:displayId/reviews/:displayReviewId/replies
export const createDisplayReviewReply = async (
  displayId: number,
  displayReviewId: number,
  body: CreateDisplayReviewReplyRequestDto,
): Promise<CreateDisplayReviewReplyResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/replies`, {
    method: 'POST',
    body,
  });

// DELETE /v1/display/:displayId/reviews/:displayReviewId/reply/:displayReviewReplyId
export const deleteDisplayReviewReply = async (
  displayId: number,
  displayReviewId: number,
  displayReviewReplyId: number,
): Promise<DeleteDisplayReviewReplyResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/reply/${displayReviewReplyId}`, {
    method: 'DELETE',
  });

// POST /v1/display/:displayId/reviews/:displayReviewId/reply/:displayReviewReplyId/like
export const toggleDisplayReviewReplyLike = async (
  displayId: number,
  displayReviewId: number,
  displayReviewReplyId: number,
): Promise<DisplayReviewReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/display/${displayId}/reviews/${displayReviewId}/reply/${displayReviewReplyId}/like`,
    { method: 'POST' },
  );
