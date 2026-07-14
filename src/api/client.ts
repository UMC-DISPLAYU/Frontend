import type { ApiResponseDto } from '@/api/dto';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = object;

interface ApiRequestOptions<TBody> extends Omit<RequestInit, 'body'> {
  body?: TBody;
  query?: QueryParams;
}

// Query string builder for endpoint request params
export const createQueryString = (query?: QueryParams): string => {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query as Record<string, QueryValue>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};

// Dynamic HTTP request helper: method and endpoint are provided by each endpoint function
export const apiRequest = async <TData, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TData> => {
  const { body, headers, query, ...init } = options;

  const response = await fetch(`${path}${createQueryString(query)}`, {
    ...init,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as ApiResponseDto<TData> | null;

  if (data?.resultType === 'FAIL') {
    throw new Error(data.error.message);
  }

  if (!response.ok || !data) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return data.success.data;
};
