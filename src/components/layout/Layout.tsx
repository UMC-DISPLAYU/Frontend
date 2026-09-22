import { useEffect, useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useRedirectAfterLogin } from '@/hooks/usePendingRedirect';
import { useUserStore } from '@/stores/useUserStore';
import { cn } from '@/utils/cn';

import { FNB } from './FNB';
import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';

type LayoutHandle = {
  showNavbar?: (pathname: string) => boolean;
  showFooter?: (pathname: string) => boolean;
};

export function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const [manualFooterHidden, setManualFooterHidden] = useState(false);
  const [manualNavbarHidden, setManualNavbarHidden] = useState(false);

  /* 로그인 상태일 때 계정 정보를 userStore에 sync합니다. */
  const { data: userMe } = useUserMe();
  const setUserMe = useUserStore((s) => s.setUserMe);

  useEffect(() => {
    if (userMe) setUserMe(userMe);
  }, [userMe, setUserMe]);

  // 로그인 후 복귀 경로가 있는 경우 이동 처리
  useRedirectAfterLogin();

  // 페이지 전환 시 화면 스크롤 위치 최상단 리셋
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.overflow-y-auto').forEach((el) => {
      el.scrollTop = 0;
    });
  }, [location.pathname]);

  // 기본은 숨김이며, 표시할 페이지의 route handle에서만 활성화합니다.
  const shouldShowNavbar =
    !manualNavbarHidden &&
    matches.some((match) => (match.handle as LayoutHandle)?.showNavbar?.(location.pathname));
  const shouldShowFooter =
    !manualFooterHidden &&
    matches.some((match) => (match.handle as LayoutHandle)?.showFooter?.(location.pathname));

  return (
    <FooterContext.Provider
      value={{
        isFooterHidden: !shouldShowFooter,
        setFooterHidden: setManualFooterHidden,
        isNavbarHidden: !shouldShowNavbar,
        setNavbarHidden: setManualNavbarHidden,
      }}
    >
      <div className="flex min-h-dvh flex-col justify-between">
        <main className={cn('flex-1', shouldShowNavbar && 'pb-3')}>
          <Outlet />
        </main>

        {/* Footer (FNB) */}
        {shouldShowFooter && <FNB hasFixedBottomBar={shouldShowNavbar} />}

        {/* Navigation Bar (Navbar) */}
        {shouldShowNavbar && (
          <div className="pointer-events-none fixed right-0 bottom-4 left-0 z-50 flex justify-center px-4">
            <div className="pointer-events-auto flex w-full max-w-md justify-center">
              <Navbar />
            </div>
          </div>
        )}
      </div>
    </FooterContext.Provider>
  );
}
