import { AxiosError, CanceledError } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/queryClient';
import { getErrorMessage, isRequestCanceled } from '@/utils/error';

import { ApiError, axiosInstance } from './axios';
import { apiRequest } from './client';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: { getState: () => ({ accessToken: null, sessionVersion: 0 }) },
}));
const adapter = axiosInstance.defaults.adapter;
afterEach(() => {
  axiosInstance.defaults.adapter = adapter;
  queryClient.clear();
});

describe('API 오류 전달과 안내', () => {
  it.each([
    ['ERR_NETWORK', '네트워크 연결'],
    ['ECONNABORTED', '요청 시간이 초과'],
    ['ETIMEDOUT', '요청 시간이 초과'],
  ])('%s 원인을 보존하고 내부 메시지 대신 안내한다', async (code, message) => {
    axiosInstance.defaults.adapter = async (config) => {
      throw new AxiosError('internal transport error', code, config);
    };
    const error = await apiRequest('/test').catch((error) => error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ transportCode: code, code: undefined });
    expect(getErrorMessage(error, '기본 안내')).toContain(message);
  });

  it.each([200, 400, 500])(
    'HTTP %i 실패 응답의 business code와 details를 보존한다',
    async (status) => {
      axiosInstance.defaults.adapter = async (config) => {
        const response = {
          config,
          status,
          statusText: '',
          headers: {},
          data: {
            resultType: 'FAIL',
            error: {
              code: 'VERIFICATION_CODE_EXPIRED',
              message: '인증번호가 만료되었습니다.',
              details: { field: 'code' },
            },
          },
        };
        if (status >= 400)
          throw new AxiosError('internal error', 'ERR_BAD_RESPONSE', config, undefined, response);
        return response;
      };
      const error = await apiRequest('/test').catch((error) => error);
      expect(error).toMatchObject({
        code: 'VERIFICATION_CODE_EXPIRED',
        status,
        details: { field: 'code' },
      });
      expect(getErrorMessage(error, '기본 안내')).toContain(
        status >= 500 ? '서버에 일시적인 문제' : '인증번호가 만료',
      );
    },
  );

  it('취소는 원래 오류로 전달하고 사용자 알림과 자동 재시도를 생략한다', async () => {
    const canceled = new CanceledError('canceled');
    let calls = 0;
    axiosInstance.defaults.adapter = async () => {
      calls++;
      throw canceled;
    };
    await expect(
      queryClient.fetchQuery({ queryKey: ['cancel'], queryFn: () => apiRequest('/test') }),
    ).rejects.toBe(canceled);
    expect(calls).toBe(1);
    expect(isRequestCanceled(canceled)).toBe(true);
    expect(getErrorMessage(canceled, '기본 안내')).toBe('');
  });

  it.each([null, '<html>upstream error</html>', { resultType: 'FAIL', error: null }])(
    '비정형 응답도 TypeError 없이 처리한다: %j',
    async (data) => {
      axiosInstance.defaults.adapter = async (config) => ({
        config,
        status: 200,
        statusText: '',
        headers: {},
        data,
      });
      const error = await apiRequest('/test').catch((error) => error);
      expect(error).toBeInstanceOf(ApiError);
      expect(getErrorMessage(error, '기본 안내')).toBe('기본 안내');
    },
  );

  it('알 수 없는 내부 오류는 화면의 fallback을 사용한다', () => {
    expect(getErrorMessage(new Error('database unavailable'), '저장하지 못했어요.')).toBe(
      '저장하지 못했어요.',
    );
    expect(
      getErrorMessage(
        new ApiError('Duplicate', { status: 409, code: 'DUPLICATE_NICKNAME' }),
        '기본 안내',
      ),
    ).toBe('Duplicate');
  });
});
