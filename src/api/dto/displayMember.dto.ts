import type { ApiResponseDto } from './common.dto';

export interface CreateDisplayInvitationResponseDataDto {
  displayId: number;
  invitationUrl: string;
}

export type CreateDisplayInvitationResponseDto =
  ApiResponseDto<CreateDisplayInvitationResponseDataDto>;

export interface DisableDisplayInvitationResponseDataDto {
  displayId: number;
  invitationDisabledAt: string;
}

export type DisableDisplayInvitationResponseDto =
  ApiResponseDto<DisableDisplayInvitationResponseDataDto>;

export interface InviteDisplayMemberRequestDto {
  inviteeUserId: number;
  role?: string;
}

export interface AcceptDisplayInvitationRequestDto {
  displayNickname: string;
}

export interface DisplayMemberInvitationDto {
  invitationId: number;
  displayId: number;
  inviterUserId: number;
  inviteeUserId: number;
  status: string;
  createdAt: string;
  respondedAt: string;
}

export type DisplayMemberInvitationResponseDto = ApiResponseDto<DisplayMemberInvitationDto>;

export interface MyDisplayInvitationDto {
  invitationId: number;
  displayId: number;
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  leaderName: string;
  title: string;
  placeName: string;
}

export interface GetMyDisplayInvitationsResponseDataDto {
  invitations: MyDisplayInvitationDto[];
}

export type GetMyDisplayInvitationsResponseDto =
  ApiResponseDto<GetMyDisplayInvitationsResponseDataDto>;

export interface TeamMemberDto {
  teamMemberId: number;
  userId: number;
  displayNickname: string;
  role: string;
}

export interface GetDisplayMembersResponseDataDto {
  displayId: number;
  members: TeamMemberDto[];
}

export type GetDisplayMembersResponseDto = ApiResponseDto<GetDisplayMembersResponseDataDto>;
