import axios from 'axios';

import { ApiError } from '@/api/apiError';

export const isRequestCanceled = (error: unknown) =>
  axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError');

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isRequestCanceled(error)) return '';
  if (!(error instanceof Error)) return fallback;

  const transportCode =
    error instanceof ApiError
      ? error.transportCode
      : axios.isAxiosError(error)
        ? error.code
        : undefined;
  if (transportCode === 'ECONNABORTED' || transportCode === 'ETIMEDOUT') {
    return '요청 시간이 초과되었어요. 잠시 후 다시 시도해주세요.';
  }
  if (transportCode === 'ERR_NETWORK' || /failed to fetch|network ?error/i.test(error.message)) {
    return '네트워크 연결을 확인해주세요.';
  }
  if (error instanceof ApiError) {
    if (error.status && error.status >= 500)
      return '서버에 일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.';
    if (error.code && error.message) return error.message;
    if (error.status === 401) return '로그인이 필요해요. 다시 로그인해주세요.';
    if (error.status === 403) return '이 작업을 수행할 권한이 없어요.';
    if (error.status === 404) return '요청한 정보를 찾을 수 없어요.';
    if (error.status === 429) return '요청이 너무 많아요. 잠시 후 다시 시도해주세요.';
  }
  return fallback;
};
