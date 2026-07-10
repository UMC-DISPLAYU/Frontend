import type { ApiResponseDto } from './common.dto';

export interface DisplayInviteLinkDto {
  displayId: number;
  inviteUrl: string;
  expiredAt: string;
}

export type CreateDisplayInviteLinkResponseDto = ApiResponseDto<DisplayInviteLinkDto>;

export type GetDisplayInviteLinkResponseDto = ApiResponseDto<DisplayInviteLinkDto>;

export interface AcceptDisplayInviteRequestDto {
  displayId: number;
  authorName: string;
}

export interface AcceptDisplayInviteResponseDataDto {
  displayId: number;
  displayTitle: string;
  authorName: string;
  userNickname: string;
  role: string;
  isSchoolVerified: boolean;
}

export type AcceptDisplayInviteResponseDto = ApiResponseDto<AcceptDisplayInviteResponseDataDto>;

export interface InviteDisplayMemberByNicknameRequestDto {
  nickname: string;
}

export interface InviteDisplayMemberByNicknameResponseDataDto {
  displayMemberId: number;
  displayId: number;
  nickname: string;
  memberName: string | null;
  profileImageUrl: string | null;
  role: string;
  status: string;
  statusDescription: string;
}

export type InviteDisplayMemberByNicknameResponseDto =
  ApiResponseDto<InviteDisplayMemberByNicknameResponseDataDto>;

export interface DisplayMemberDto {
  userId: number;
  name: string;
  nickname: string;
  isVerified: boolean;
}

export interface GetDisplayMembersResponseDataDto {
  displayId: number;
  members: DisplayMemberDto[];
}

export type GetDisplayMembersResponseDto = ApiResponseDto<GetDisplayMembersResponseDataDto>;

export interface RejectDisplayInvitationResponseDataDto {
  displayId: number;
  isRejected: boolean;
}

export type RejectDisplayInvitationResponseDto =
  ApiResponseDto<RejectDisplayInvitationResponseDataDto>;

export interface DeactivateDisplayInviteLinkResponseDataDto {
  displayId: number;
  isDeactivated: boolean;
}

export type DeactivateDisplayInviteLinkResponseDto =
  ApiResponseDto<DeactivateDisplayInviteLinkResponseDataDto>;
