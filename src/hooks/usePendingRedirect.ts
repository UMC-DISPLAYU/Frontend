import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import {
  clearPendingRedirect,
  consumePendingRedirect,
  savePendingRedirect,
} from '@/utils/pendingRedirect';

/*
 * 로그인이 필요한 화면에서 "로그인하고 여기로 돌아와라"를 예약
 * 이미 로그인 상태면 예약할 이유가 없으므로 남아 있던 경로를 정리
 * path가 null이면 아무것도 하지 않음
 *  */
export function useReserveRedirectAfterLogin(path: string | null) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      clearPendingRedirect();
      return;
    }

    if (!path) return;

    savePendingRedirect(path);
  }, [accessToken, path]);
}

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
