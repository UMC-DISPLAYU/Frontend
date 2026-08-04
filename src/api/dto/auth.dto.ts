import type { ApiResponseDto } from './common.dto';

export interface AuthUserDto {
  id: number;
  provider: string;
  providerId?: string; //회원가입에서 없어서 optional로 처리
  name: string;
  nickname: string;
  socialEmail: string;
  schoolEmail: string | null;
  isVerified: boolean;
}

export interface OAuthAuthorizationUrlResponseDto {
  authorizationUrl: string;
}

export interface SignupAgreementDto {
  code: string;
  version: string;
}

export interface SignupRequestDto {
  nickname: string;
  agreements: SignupAgreementDto[];
  isOver14: boolean;
}

export interface SignupResponseDataDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken?: string;
}

export type SignupResponseDto = ApiResponseDto<SignupResponseDataDto>;

export interface RefreshTokenResponseDataDto {
  accessToken: string;
}

export type RefreshTokenResponseDto = ApiResponseDto<RefreshTokenResponseDataDto>;

export interface LogoutRequestDto {
  refreshToken?: string;
}

export type LogoutResponseDto = ApiResponseDto<null>;
