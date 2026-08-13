import type { ApiResponseDto } from '@/api/dto';

import { axiosInstance } from './axios';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = object;

interface ApiRequestOptions<TBody> {
  body?: TBody;
  headers?: Record<string, string>;
  method?: string;
  query?: QueryParams;
  signal?: AbortSignal;
}

// Query string builder for endpoint request params
export const createQueryString = (query?: QueryParams): string => {
  if (!query || Object.keys(query).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(key, String(v));
        }
      });
    } else if (
      typeof value === 'string' &&
      value.includes(',') &&
      ['field', 'status', 'region', 'type', 'fields'].includes(key)
    ) {
      value.split(',').forEach((v) => {
        const trimmed = v.trim();
        if (trimmed) {
          searchParams.append(key, trimmed);
        }
      });
    } else {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};

// Dynamic HTTP request helper: method and endpoint are provided by each endpoint function
export const apiRequest = async <TData, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TData> => {
  const { body, headers, method = 'GET', query, signal } = options;
  const response = await axiosInstance.request<ApiResponseDto<TData>>({
    data: body,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    method,
    params: query,
    paramsSerializer: (params) => createQueryString(params).slice(1),
    signal,
    url: path,
  });
  const data = response.data;

  if (data?.resultType === 'FAIL') {
    throw new Error(data.error.message);
  }

  if (!data) {
    throw new Error('API request failed');
  }

  return data.success.data;
};
