import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosInstance } from './axios';

const auth = vi.hoisted(() => ({
  accessToken: 'old-token' as string | null,
  sessionVersion: 0,
  refreshAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({ useAuthStore: { getState: () => auth } }));

const response = (config: InternalAxiosRequestConfig, status: number, data: unknown) => ({
  config,
  status,
  data,
  headers: {},
  statusText: String(status),
});
const unauthorized = (config: InternalAxiosRequestConfig, status = 401) =>
  new AxiosError(
    'Unauthorized',
    'ERR_BAD_RESPONSE',
    config,
    undefined,
    response(config, status, { resultType: 'FAIL', error: { message: 'expired' } }),
  );

describe('토큰 갱신 요청 공유', () => {
  const adapter = axiosInstance.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
    auth.accessToken = 'old-token';
    auth.sessionVersion = 0;
    auth.refreshAccessToken.mockImplementation((token: string) => {
      auth.accessToken = token;
    });
    auth.clearAccessToken.mockImplementation(() => {
      auth.accessToken = null;
      auth.sessionVersion++;
    });
  });

  afterEach(() => {
    axiosInstance.defaults.adapter = adapter;
    vi.unstubAllGlobals();
  });

  it.each(['success', '401', '500', 'missing-token'])(
    '동시 요청에 갱신 결과를 전달한다: %s',
    async (outcome) => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      let refreshCalls = 0;
      let initialCalls = 0;
      const replace = vi.fn();
      const setItem = vi.fn();
      vi.stubGlobal('window', { location: { pathname: '/private', search: '?tab=1', replace } });
      vi.stubGlobal('sessionStorage', { setItem });

      axiosInstance.defaults.adapter = async (config) => {
        if (config.url === '/v1/auth/refresh') {
          refreshCalls++;
          await gate;
          if (outcome === '401' || outcome === '500') throw unauthorized(config, Number(outcome));
          return response(config, 200, {
            resultType: 'SUCCESS',
            success: { data: outcome === 'success' ? { accessToken: 'new-token' } : {} },
          });
        }
        if (config.headers.get('Authorization') === 'Bearer new-token') {
          return response(config, 200, { resultType: 'SUCCESS', success: { data: config.url } });
        }
        initialCalls++;
        throw unauthorized(config);
      };

      const requests = Promise.allSettled([
        axiosInstance.get('/first'),
        axiosInstance.get('/second'),
      ]);
      await vi.waitFor(() => {
        expect(initialCalls).toBe(2);
        expect(refreshCalls).toBe(1);
      });
      release();
      const results = await requests;
      expect(results.map((result) => result.status)).toEqual(
        outcome === 'success' ? ['fulfilled', 'fulfilled'] : ['rejected', 'rejected'],
      );
      expect(refreshCalls).toBe(1);
      if (outcome === 'success') {
        expect(auth.refreshAccessToken).toHaveBeenCalledWith('new-token');
        expect(replace).not.toHaveBeenCalled();
      } else {
        expect(auth.clearAccessToken).toHaveBeenCalledTimes(1);
        expect(setItem).toHaveBeenCalledWith('pending-redirect', '/private?tab=1');
        expect(replace).toHaveBeenCalledOnce();
        expect(replace).toHaveBeenCalledWith('/login');
      }
    },
  );

  it.each(['late-401', 'refresh-success', 'refresh-failure'])(
    '세션 변경 뒤 도착한 %s 응답은 새 로그인 상태를 변경하지 않는다',
    async (outcome) => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      let initialCalls = 0;
      let refreshCalls = 0;
      axiosInstance.defaults.adapter = async (config) => {
        if (config.url === '/v1/auth/refresh') {
          refreshCalls++;
          await gate;
          if (outcome === 'refresh-failure') throw unauthorized(config, 500);
          return response(config, 200, {
            resultType: 'SUCCESS',
            success: { data: { accessToken: 'stale-token' } },
          });
        }
        initialCalls++;
        if (outcome === 'late-401') await gate;
        throw unauthorized(config);
      };
      const pending = Promise.allSettled([axiosInstance.get('/private')]);
      await vi.waitFor(() => expect(outcome === 'late-401' ? initialCalls : refreshCalls).toBe(1));
      auth.accessToken = 'other-account';
      auth.sessionVersion++;
      release();
      expect((await pending)[0].status).toBe('rejected');
      expect(auth.accessToken).toBe('other-account');
      expect(auth.refreshAccessToken).not.toHaveBeenCalled();
      expect(auth.clearAccessToken).not.toHaveBeenCalled();
      expect(initialCalls).toBe(1);
      expect(refreshCalls).toBe(outcome === 'late-401' ? 0 : 1);
    },
  );

  it('재시도 요청의 401은 다시 갱신하지 않고 다음 독립 요청은 새 갱신을 시작한다', async () => {
    let refreshCalls = 0;
    axiosInstance.defaults.adapter = async (config) => {
      if (config.url === '/v1/auth/refresh') {
        refreshCalls++;
        return response(config, 200, {
          resultType: 'SUCCESS',
          success: { data: { accessToken: 'new-token' } },
        });
      }
      throw unauthorized(config);
    };
    await expect(axiosInstance.get('/first')).rejects.toThrow('expired');
    expect(refreshCalls).toBe(1);
    await expect(axiosInstance.get('/second')).rejects.toThrow('expired');
    expect(refreshCalls).toBe(2);
  });
});
