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
