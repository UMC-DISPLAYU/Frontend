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

export interface LoginRequestDto {
  provider: string;
  idToken: string;
}

export interface OAuthAuthorizationUrlResponseDto {
  authorizationUrl: string;
}

//기존 사용자 응답
export interface ExistingUserLoginResponseDataDto {
  isNewUser: false;
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

//신규 사용자 응답
export interface NewUserLoginResponseDataDto {
  isNewUser: true;
  signupToken: string;
  provider: string;
  name: string;
  socialEmail: string;
}

export type LoginResponseDataDto = ExistingUserLoginResponseDataDto | NewUserLoginResponseDataDto;

export type LoginResponseDto = ApiResponseDto<LoginResponseDataDto>;

export interface SignupAgreementDto {
  agreeId: number;
  isAgreed: boolean;
}

export interface SignupRequestDto {
  nickname: string;
  agreements: SignupAgreementDto[];
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
