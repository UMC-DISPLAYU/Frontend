import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { consumePendingRedirect } from '@/utils/pendingRedirect';

/*
 * 로그인 전에 보관해 둔 복귀 경로가 있으면 로그인 직후 보냄
 * 로그인 완료 지점이 여러 곳이라 accessToken이 생기는 순간을 한곳에서 감지
 */
export function useRedirectAfterLogin() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;

    const path = consumePendingRedirect();

    if (path) navigate(path, { replace: true });
  }, [accessToken, navigate]);
}
