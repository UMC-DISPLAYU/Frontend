import type {
  AcceptDisplayInviteRequestDto,
  AcceptDisplayInviteResponseDataDto,
  DeactivateDisplayInviteLinkResponseDataDto,
  DisplayInviteLinkDto,
  GetDisplayMembersResponseDataDto,
  InviteDisplayMemberByNicknameRequestDto,
  InviteDisplayMemberByNicknameResponseDataDto,
  RejectDisplayInvitationResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/display-member/:displayId/invite-link
export const createDisplayInviteLink = async (displayId: number): Promise<DisplayInviteLinkDto> =>
  apiRequest(`/v1/display-member/${displayId}/invite-link`, { method: 'POST' });

// GET /v1/display-member/:displayId/invite-link
export const getDisplayInviteLink = async (displayId: number): Promise<DisplayInviteLinkDto> =>
  apiRequest(`/v1/display-member/${displayId}/invite-link`);

// POST /v1/display-member/invitations/accept
export const acceptDisplayInvite = async (
  body: AcceptDisplayInviteRequestDto,
): Promise<AcceptDisplayInviteResponseDataDto> =>
  apiRequest('/v1/display-member/invitations/accept', { method: 'POST', body });

// POST /v1/display-member/:displayId/invitations
export const inviteDisplayMemberByNickname = async (
  displayId: number,
  body: InviteDisplayMemberByNicknameRequestDto,
): Promise<InviteDisplayMemberByNicknameResponseDataDto> =>
  apiRequest(`/v1/display-member/${displayId}/invitations`, { method: 'POST', body });

// GET /v1/display-member/:displayId/members
export const getDisplayMembers = async (
  displayId: number,
): Promise<GetDisplayMembersResponseDataDto> =>
  apiRequest(`/v1/display-member/${displayId}/members`);

// POST /v1/display-member/:displayId/invitations/reject
export const rejectDisplayInvitation = async (
  displayId: number,
): Promise<RejectDisplayInvitationResponseDataDto> =>
  apiRequest(`/v1/display-member/${displayId}/invitations/reject`, { method: 'POST' });

// DELETE /v1/display-member/:displayId/invite-link
export const deactivateDisplayInviteLink = async (
  displayId: number,
): Promise<DeactivateDisplayInviteLinkResponseDataDto> =>
  apiRequest(`/v1/display-member/${displayId}/invite-link`, { method: 'DELETE' });
