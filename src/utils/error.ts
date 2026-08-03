const NETWORK_ERROR_PATTERNS = ['failed to fetch', 'network error', 'networkerror'];

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error) || !error.message) return fallback;

  const isNetworkError = NETWORK_ERROR_PATTERNS.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );

  if (isNetworkError) return '네트워크 연결을 확인해주세요.';

  return error.message;
};
