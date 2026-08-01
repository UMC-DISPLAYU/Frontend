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
  profileImageUrl?: string;
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
  externalLink?: string | null;
  portfolioUrl?: string | null;
  fields: string[];
}

export interface UpdateArtistProfileRequestDto {
  profileImageUrl?: string;
  artistName: string;
  introduction?: string;
  fields: string[];
  externalLink?: string;
  univName?: string;
}

export type UpdateArtistProfileResponseDataDto = Omit<UpdateArtistProfileRequestDto, 'univName'> & {
  univName?: string;
};

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
