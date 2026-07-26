import type {
  ExistingUserLoginResponseDataDto,
  OAuthAuthorizationUrlResponseDataDto,
  RefreshTokenResponseDataDto,
  SignupResponseDataDto,
} from '@/api/dto';

export const mockLoginResponse: ExistingUserLoginResponseDataDto = {
  isNewUser: false,
  accessToken: 'mock-access-token-for-displayu-production-msw',
  refreshToken: 'mock-refresh-token-for-displayu-production-msw',
  user: {
    id: 9001,
    provider: 'Google',
    providerId: 'mock-provider-id-9001',
    name: '윤서하',
    nickname: '서하의 작업실',
    socialEmail: 'seohah.yoon@example.com',
    schoolEmail: 'seohah@cau.ac.kr',
    isVerified: true,
  },
};

export const mockSignupResponse: SignupResponseDataDto = {
  accessToken: 'mock-access-token-after-signup',
  refreshToken: 'mock-refresh-token-after-signup',
  user: {
    id: 9002,
    provider: 'Google',
    name: '신규 사용자',
    nickname: 'displayu_newbie',
    socialEmail: 'newbie@example.com',
    schoolEmail: null,
    isVerified: false,
  },
};

export const mockKakaoLoginUrlResponse: OAuthAuthorizationUrlResponseDataDto = {
  authorizationUrl: 'https://kauth.kakao.com/oauth/authorize?client_id=mock&redirect_uri=mock',
};

export const mockGoogleLoginUrlResponse: OAuthAuthorizationUrlResponseDataDto = {
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=mock',
};

export const mockRefreshTokenResponse: RefreshTokenResponseDataDto = {
  accessToken: 'mock-access-token-for-displayu-production-msw',
};
