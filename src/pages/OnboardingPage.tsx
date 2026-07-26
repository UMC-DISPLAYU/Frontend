import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { refreshToken } from '@/api/endpoints';

export function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const reloadKey = 'displayu:onboarding-reload';
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const legacyNavigation = performance as Performance & {
      navigation?: { type: number };
    };
    const isReload =
      sessionStorage.getItem(reloadKey) === 'true' ||
      navigation?.type === 'reload' ||
      legacyNavigation.navigation?.type === 1;

    if (isReload) {
      sessionStorage.removeItem(reloadKey);
      navigate('/', { replace: true });
      return;
    }

    const markReload = () => {
      sessionStorage.setItem(reloadKey, 'true');
    };

    window.addEventListener('beforeunload', markReload);
    void refreshToken().then((data) => {
      localStorage.setItem('accessToken', data.accessToken);
    });

    return () => {
      window.removeEventListener('beforeunload', markReload);
    };
  }, [navigate]);

  return <div className="w-full max-w-105 mx-auto min-h-dvh bg-page" />;
}
