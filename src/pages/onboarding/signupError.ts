import { ApiError } from '@/api/apiError';
import { getErrorMessage } from '@/utils/error';

export const SIGNUP_SESSION_EXPIRED_MESSAGE = '가입 정보가 만료되었어요. 다시 로그인해주세요.';

/**
 * 가입 요청은 소셜 로그인 때 받은 가입 토큰(HttpOnly 쿠키)으로 인증해서, 토큰이 없거나 만료되면 401이 온다.
 * axios 인터셉터가 401을 로그인 토큰 만료로 보고 리프레시를 시도하므로, 화면에는 원래 코드 대신
 * 리프레시 실패(INVALID_REFRESH_TOKEN)가 올라온다. 그래서 코드가 아니라 상태로 판단한다.
 */
export const getSignupErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401) return SIGNUP_SESSION_EXPIRED_MESSAGE;
  return getErrorMessage(error, '가입 완료에 실패했어요.');
};
