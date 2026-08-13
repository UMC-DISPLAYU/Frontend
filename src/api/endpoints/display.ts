import type {
  CreateDisplayInvitationLinkResponseDataDto,
  CreateDisplayRequestDto,
  CreateDisplayResponseDataDto,
  CreateDisplayReviewReplyRequestDto,
  CreateDisplayReviewReplyResponseDataDto,
  CreateDisplayReviewRequestDto,
  CreateDisplayReviewResponseDataDto,
  DeleteDisplayReviewReplyResponseDataDto,
  DeleteDisplayReviewResponseDataDto,
  DisableDisplayInvitationLinkResponseDataDto,
  DisplayDetailDto,
  DisplayLikeStatusResponseDataDto,
  DisplayListResponseDataDto,
  DisplayMemberInvitationResponseDataDto,
  DisplayMemberListResponseDataDto,
  DisplayReviewLikeResponseDataDto,
  DisplayReviewReplyLikeResponseDataDto,
  GetArtistDisplaysResponseDataDto,
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
  GetMyDisplayReviewsResponseDataDto,
  GetMyDisplaysResponseDataDto,
  HomeExhibitionDto,
  InviteDisplayMemberRequestDto,
  MyDisplayInvitationListResponseDataDto,
  SearchDisplaysRequestDto,
  ToggleDisplayLikeResponseDataDto,
  UpdateDisplayRequestDto,
  UpdateDisplayReservationRequestDto,
  UpdateDisplayReservationResponseDataDto,
  UpdateDisplayResponseDataDto,
  UpdateMyDisplayNicknameRequestDto,
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

// DELETE /v1/display/:displayId
export const deleteDisplay = async (displayId: number): Promise<void> =>
  apiRequest(`/v1/display/${displayId}`, { method: 'DELETE' });

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

// PATCH /v1/display/{displayId}/reservation
// 공개 시점 조회는 별도 API 없이 전시 상세 조회 응답을 사용합니다.
export const updateDisplayReservation = async (
  displayId: number,
  body: UpdateDisplayReservationRequestDto,
): Promise<UpdateDisplayReservationResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reservation`, { method: 'PATCH', body });

// PATCH /v1/display/publish
export const publishDisplay = async (displayId: number): Promise<DisplayDetailDto> =>
  apiRequest('/v1/display/publish', { method: 'PATCH', body: { displayId } });

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

// GET /v1/display/{displayId}/isliked
export const getDisplayLikeStatus = async (
  displayId: number,
): Promise<DisplayLikeStatusResponseDataDto> => apiRequest(`/v1/display/${displayId}/isliked`);

// GET /v1/display/me
export const getMyDisplays = async (): Promise<GetMyDisplaysResponseDataDto> =>
  apiRequest('/v1/display/me');

// GET /v1/display/artists/:userId
export const getArtistDisplays = async (
  userId: number,
): Promise<GetArtistDisplaysResponseDataDto> => apiRequest(`/v1/display/artists/${userId}`);

// PATCH /v1/display/me/nickname
export const updateMyDisplayNickname = async (
  body: UpdateMyDisplayNicknameRequestDto,
): Promise<unknown> => apiRequest('/v1/display/me/nickname', { method: 'PATCH', body });

// GET /v1/display/invitation/:token
export const getDisplayInvitationByToken = async (token: string): Promise<DisplayDetailDto> =>
  apiRequest(`/v1/display/invitation/${token}`);

// POST /v1/display/:displayId/invitation
export const createDisplayInvitation = async (
  displayId: number,
): Promise<CreateDisplayInvitationLinkResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/invitation`, { method: 'POST' });

// PATCH /v1/display/:displayId/invitation/disable
export const disableDisplayInvitation = async (
  displayId: number,
): Promise<DisableDisplayInvitationLinkResponseDataDto> =>
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

// GET /v1/display-invitations
export const getMyDisplayInvitations = async (): Promise<MyDisplayInvitationListResponseDataDto> =>
  apiRequest('/v1/display-invitations');

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

// DELETE /v1/display/:displayId/reviews/:displayReviewId/like
export const cancelDisplayReviewLike = async (
  displayId: number,
  displayReviewId: number,
): Promise<DisplayReviewLikeResponseDataDto> =>
  apiRequest(`/v1/display/${displayId}/reviews/${displayReviewId}/like`, { method: 'DELETE' });

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

// DELETE /v1/display/:displayId/reviews/:displayReviewId/reply/:displayReviewReplyId/like
export const cancelDisplayReviewReplyLike = async (
  displayId: number,
  displayReviewId: number,
  displayReviewReplyId: number,
): Promise<DisplayReviewReplyLikeResponseDataDto> =>
  apiRequest(
    `/v1/display/${displayId}/reviews/${displayReviewId}/reply/${displayReviewReplyId}/like`,
    { method: 'DELETE' },
  );

// GET /v1/display/reviews/me
export const getMyDisplayReviews = async (
  params: {
    cursorId?: number;
    size?: number;
  } = {},
): Promise<GetMyDisplayReviewsResponseDataDto> =>
  apiRequest('/v1/display/reviews/me', { query: params });
