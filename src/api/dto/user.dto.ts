import type { ApiResponseDto } from './common.dto';

export interface UserProfileDto {
  id: number;
  provider: string;
  name: string;
  nickname: string;
  isVerified: boolean;
  socialEmail: string;
  schoolEmail: string | null;
}

export interface SendVerificationEmailRequestDto {
  schoolEmail: string;
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

export interface UpdateNicknameResponseDataDto {
  nickname: string;
  nextNicknameChangeAvailableAt: string;
}

export type UpdateNicknameResponseDto = ApiResponseDto<UpdateNicknameResponseDataDto>;
