import { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useGoogleAuthorizationUrl, useKakaoAuthorizationUrl } from '@/hooks/queries/useAuth';
import { clearPendingRedirect, savePendingRedirect } from '@/utils/pendingRedirect';

export type SocialLoginProvider = 'kakao' | 'google';

const LOGIN_ERROR_MESSAGE = '로그인 연결에 실패했어요. 잠시 후 다시 시도해주세요.';

/*
 * 소셜 로그인 화면으로 보낸다.
 * OAuth는 페이지를 떠났다가 홈(/home?accessToken=)으로 돌아오므로, 떠나기 전에 돌아올 경로를 남긴다.
 * redirectPath가 없으면 지금 보고 있는 화면으로 돌아온다.
 */
export function useSocialLogin(redirectPath?: string) {
  const location = useLocation();
  const kakaoAuthorizationUrl = useKakaoAuthorizationUrl();
  const googleAuthorizationUrl = useGoogleAuthorizationUrl();
  const [error, setError] = useState('');
  // URL을 받은 뒤 페이지가 바뀌기 전까지도 버튼을 막아 두 번 이동하지 않게 한다
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 소셜 로그인 화면에서 뒤로가기로 돌아오면 브라우저가 떠나기 전 상태(bfcache)를 그대로 복원한다
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsRedirecting(false);
    };

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const isPending =
    kakaoAuthorizationUrl.isPending || googleAuthorizationUrl.isPending || isRedirecting;

  const startLogin = async (provider: SocialLoginProvider) => {
    if (isPending) return;

    setError('');
    savePendingRedirect(redirectPath ?? `${location.pathname}${location.search}${location.hash}`);

    try {
      const { authorizationUrl } =
        provider === 'kakao'
          ? await kakaoAuthorizationUrl.mutateAsync()
          : await googleAuthorizationUrl.mutateAsync();

      setIsRedirecting(true);
      window.location.href = authorizationUrl;
    } catch {
      clearPendingRedirect();
      setError(LOGIN_ERROR_MESSAGE);
    }
  };

  return {
    startLogin,
    isPending,
    error,
    resetError: () => setError(''),
  };
}
