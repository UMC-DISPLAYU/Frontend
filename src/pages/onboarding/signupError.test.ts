import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/apiError';

import { getSignupErrorMessage, SIGNUP_SESSION_EXPIRED_MESSAGE } from './signupError';

describe('getSignupErrorMessage', () => {
  it('리프레시 실패로 바뀐 401은 가입 정보 만료로 안내한다', () => {
    const error = new ApiError('유효하지 않은 리프레시 토큰입니다.', {
      code: 'INVALID_REFRESH_TOKEN',
      status: 401,
    });
    expect(getSignupErrorMessage(error)).toBe(SIGNUP_SESSION_EXPIRED_MESSAGE);
  });

  it('가입 토큰 오류 401도 가입 정보 만료로 안내한다', () => {
    const error = new ApiError('유효하지 않은 회원가입 토큰입니다.', {
      code: 'INVALID_SIGNUP_TOKEN',
      status: 401,
    });
    expect(getSignupErrorMessage(error)).toBe(SIGNUP_SESSION_EXPIRED_MESSAGE);
  });

  it('401이 아닌 서버 오류는 서버 문구를 그대로 쓴다', () => {
    const error = new ApiError('이미 사용 중인 닉네임이에요.', {
      code: 'USER_NICKNAME_DUPLICATED',
      status: 409,
    });
    expect(getSignupErrorMessage(error)).toBe('이미 사용 중인 닉네임이에요.');
  });

  it('알 수 없는 오류는 기본 문구를 쓴다', () => {
    expect(getSignupErrorMessage('oops')).toBe('가입 완료에 실패했어요.');
  });
});
