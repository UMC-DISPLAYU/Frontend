import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';

import { ApiError, axiosInstance } from '@/api/axios';

import { useUserSearch } from './useUserSearch';

vi.mock('@tanstack/react-query', async (original) => ({
  ...(await original<typeof import('@tanstack/react-query')>()),
  useQuery: vi.fn(),
}));
vi.mock('@/stores/authStore', () => ({
  useAuthStore: { getState: () => ({ accessToken: null, sessionVersion: 0 }) },
}));
const adapter = axiosInstance.defaults.adapter;
afterEach(() => {
  axiosInstance.defaults.adapter = adapter;
  vi.clearAllMocks();
});
const search = () => {
  // useQuery를 mock해 실제 queryFn만 실행합니다.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useUserSearch(' nickname ');
  const options = vi.mocked(useQuery).mock.calls[0][0];
  expect(options).not.toHaveProperty('placeholderData');
  return (options.queryFn as () => Promise<unknown>)();
};

it.each([
  [404, 'USER_NICKNAME_NOT_FOUND', true],
  [404, 'OTHER_NOT_FOUND', false],
  [403, 'FORBIDDEN', false],
  [500, 'INTERNAL_ERROR', false],
])('HTTP %i / %s에서 검색 결과 없음만 성공으로 바꾼다', async (status, code, empty) => {
  axiosInstance.defaults.adapter = async (config) => {
    throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
      config,
      headers: {},
      status,
      statusText: '',
      data: { resultType: 'FAIL', error: { code, message: '서버 메시지' } },
    });
  };
  if (empty) await expect(search()).resolves.toEqual([]);
  else await expect(search()).rejects.toMatchObject({ name: 'ApiError', code, status });
});

it('네트워크 실패를 유지하고 정상 결과를 전달한다', async () => {
  axiosInstance.defaults.adapter = async (config) => {
    throw new AxiosError('Network Error', 'ERR_NETWORK', config);
  };
  await expect(search()).rejects.toBeInstanceOf(ApiError);
  const users = [{ userId: 1, nickname: 'nickname' }];
  axiosInstance.defaults.adapter = async (config) => ({
    config,
    headers: {},
    status: 200,
    statusText: '',
    data: { resultType: 'SUCCESS', success: { data: users } },
  });
  await expect(search()).resolves.toEqual(users);
});
