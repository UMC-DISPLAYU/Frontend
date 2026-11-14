import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/apiError';

import { isNotFoundError } from './error';

describe('isNotFoundError', () => {
  it.each([404, 403])('HTTP %i 는 404 화면 대상이다', (status) => {
    expect(isNotFoundError(new ApiError('error', { status }))).toBe(true);
  });

  it.each([400, 401, 405, 500, undefined])('HTTP %s 는 404 화면 대상이 아니다', (status) => {
    expect(isNotFoundError(new ApiError('error', { status }))).toBe(false);
  });

  it('ApiError 가 아니면 404 화면 대상이 아니다', () => {
    expect(isNotFoundError(new Error('404'))).toBe(false);
    expect(isNotFoundError({ status: 404 })).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});
