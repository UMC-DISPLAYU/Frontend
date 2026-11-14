import type { ApiResponseDto } from './common.dto';

export interface UserProfileDto {
  id: number;
  provider: string;
  name: string;
  nickname: string;
  profileImageUrl?: string | null;
  isVerified: boolean;
  socialEmail: string;
  schoolEmail: string | null;
}

export interface SendVerificationEmailRequestDto {
  schoolEmail: string;
  univName?: string;
}

export type SendVerificationEmailResponseDto = ApiResponseDto<null>;

export interface ConfirmVerificationEmailRequestDto {
  schoolEmail: string;
  verificationCode: string;
}

export interface ConfirmVerificationEmailResponseDataDto {
  schoolEmail: string;
  isVerified: boolean;
}

export type ConfirmVerificationEmailResponseDto =
  ApiResponseDto<ConfirmVerificationEmailResponseDataDto>;

export interface ResendVerificationEmailRequestDto {
  schoolEmail: string;
  univName?: string;
}

export type ResendVerificationEmailResponseDto = ApiResponseDto<null>;

export interface CheckNicknameRequestDto {
  nickname: string;
}

export interface CheckNicknameResponseDataDto {
  nickname: string;
  isAvailable: boolean;
}

export type CheckNicknameResponseDto = ApiResponseDto<CheckNicknameResponseDataDto>;

export type GetUserMeResponseDto = ApiResponseDto<UserProfileDto>;

export type DeleteUserMeResponseDto = ApiResponseDto<null>;

export interface UpdateNicknameRequestDto {
  nickname: string;
}

export interface UpdateMyProfileRequestDto {
  /** null 이면 사진을 지운다 */
  profileImageUrl?: string | null;
  nickname?: string;
}

export interface UpdateMyProfileResponseDataDto {
  profileImageUrl: string;
  nickname: string;
}

export interface UpdateNicknameResponseDataDto {
  nickname: string;
  nextNicknameChangeAvailableAt: string;
}

export type UpdateNicknameResponseDto = ApiResponseDto<UpdateNicknameResponseDataDto>;

export interface ArtistProfileDto {
  profileImageUrl?: string | null;
  artistName: string;
  introduction?: string | null;
  status?: string;
  schoolName?: string;
  /* Portfolio 링크 */
  externalLink?: string | null;
  instagramLink?: string | null;
  fields: string[];
}

/* 서버가 요청 전체로 덮어써서, 빠진 값(사진 · 소개 · 링크)은 지워진다. 바꾸지 않은 값도 현재 값을 보낸다 */
export interface UpdateArtistProfileRequestDto {
  profileImageUrl: string | null;
  artistName: string;
  introduction: string;
  fields: string[];
  /* Portfolio 링크 */
  externalLink: string | null;
  instagramLink: string | null;
  /* 없으면 서버가 기존 학교를 유지한다 */
  univName?: string;
}

export type UpdateArtistProfileResponseDataDto = Omit<UpdateArtistProfileRequestDto, 'univName'> & {
  univName?: string;
};

export interface SearchUsersRequestDto {
  nickname: string;
}

export interface UserSearchDto {
  userId: number;
  name: string;
  nickname: string;
}

/* 닉네임이 정확히 일치하는 사용자 한 명입니다. 없으면 404 USER_NICKNAME_NOT_FOUND 로 응답합니다. */
export type SearchUsersResponseDataDto = UserSearchDto;

export interface SchoolSearchRequestDto {
  keyword?: string;
}

export interface SchoolSearchDto {
  name: string;
}

export interface SchoolSearchResponseDataDto {
  schools: SchoolSearchDto[];
}

export type GetMyArtistProfileResponseDto = ApiResponseDto<ArtistProfileDto>;

export type GetUserArtistProfileResponseDto = ApiResponseDto<Omit<ArtistProfileDto, 'status'>>;
