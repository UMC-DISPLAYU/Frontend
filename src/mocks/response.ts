import { HttpResponse } from 'msw';

import type { ApiResponseDto } from '@/api/dto';

export const createSuccessResponse = <TData>(data: TData, path: string): ApiResponseDto<TData> => ({
  resultType: 'SUCCESS',
  success: {
    data,
  },
  error: null,
  meta: {
    path,
    timestamp: new Date().toISOString(),
  },
});

export const createSuccessJson = <TData>(path: string, data: TData) =>
  HttpResponse.json(createSuccessResponse(data, path));

export const success = createSuccessJson;

export const created = <TData>(path: string, data: TData) =>
  HttpResponse.json(createSuccessResponse(data, path), { status: 201 });

export const noContent = (path: string) => success(path, null);

export const readJson = async <TBody>(request: Request): Promise<Partial<TBody>> => {
  try {
    return (await request.json()) as Partial<TBody>;
  } catch {
    return {};
  }
};

export const toNumber = (value: string | readonly string[] | undefined, fallback = 0) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const paths = (swaggerPath: string) => {
  const mswPath = swaggerPath.replace(/\{([^}]+)\}/g, ':$1');
  const withoutApiPrefix = mswPath.replace(/^\/api/, '');

  return mswPath === withoutApiPrefix ? [`*${mswPath}`] : [`*${mswPath}`, `*${withoutApiPrefix}`];
};

export const cursorPagination = <TCursor extends number | string>(
  nextCursor: TCursor | null,
  size: number,
) => ({
  nextCursor,
  size,
  hasNext: false,
});

export const cursorPageInfo = (size: number) => ({
  nextCursorId: null,
  size,
  hasNext: false,
});
