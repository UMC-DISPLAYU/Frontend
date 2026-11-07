import { useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { refreshToken } from '@/api/endpoints';
import { useAuthStore } from '@/stores/authStore';

/** 기존 홈(Homepage)의 진입 시 인증 처리를 그대로 옮긴 것이다 */
export function useHomeAuthBootstrap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  // OAuth 콜백이 ?accessToken= 으로 홈에 돌아온다. 토큰을 저장하고 주소에서 지운다
  useEffect(() => {
    const token = searchParams.get('accessToken');
    if (!token) return;

    setAccessToken(token);
    navigate('/home', { replace: true });
  }, [navigate, searchParams, setAccessToken]);

  // OAuth 콜백 이후 refreshToken 쿠키만 있고 accessToken 이 없는 상태(기존 회원)일 수 있어서,
  // 홈 진입 시 accessToken 이 없으면 1회 재발급을 시도한다.
  useEffect(() => {
    const sessionVersion = useAuthStore.getState().sessionVersion;
    if (accessToken || sessionVersion !== 0) return;

    void refreshToken()
      .then(({ accessToken: newAccessToken }) => {
        if (useAuthStore.getState().sessionVersion === sessionVersion) {
          setAccessToken(newAccessToken);
        }
      })
      .catch(() => {
        // 비회원/게스트일 수 있으므로 조용히 무시 (refresh token 쿠키 자체가 없는 경우)
      });
  }, [accessToken, setAccessToken]);
}
