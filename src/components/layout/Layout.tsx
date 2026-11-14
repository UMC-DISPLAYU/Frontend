import { useMemo, useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { useRedirectAfterLogin } from '@/hooks/usePendingRedirect';
import { useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';
import { useReportNavbarPresence } from './navbarPresence';

export function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const [manualNavbarHidden, setManualNavbarHidden] = useState(false);
  const isKeyboardOpen = useIsKeyboardOpen();

  // 로그인 후 복귀 경로가 있는 경우 이동 처리
  // ⚠️ RootLayout 으로 옮기지 않는다. Layout 밖인 온보딩은 가입 직후 토큰이 생겨도 완료 화면을 보여줘야 하고,
  // 완료 화면에서 홈으로 넘어와 Layout 이 그려질 때 복귀한다.
  useRedirectAfterLogin();

  // 하단 네비게이션 바(Navbar) 표시 여부 (홈, 검색, 마이)
  const showNavbarPaths = ['/home', '/search'];
  const exactNavbarPaths = ['/my'];

  const isRouteHandleNavbarHidden = matches.some(
    (match) => (match.handle as { hideNavbar?: boolean })?.hideNavbar,
  );

  const shouldShowNavbar =
    (showNavbarPaths.some((path) => location.pathname.startsWith(path)) ||
      exactNavbarPaths.some((path) => location.pathname === path)) &&
    !isRouteHandleNavbarHidden &&
    !manualNavbarHidden;

  // 키보드가 열리면 냅바를 숨긴다. 본문 하단 여백은 shouldShowNavbar 기준이라 입력 중에 레이아웃이 흔들리지 않는다
  const isNavbarVisible = shouldShowNavbar && !isKeyboardOpen;
  useReportNavbarPresence(isNavbarVisible);

  // useHideNavbar 가 context 를 effect 의존성으로 쓰므로 렌더마다 새 객체를 만들지 않는다
  const footerContextValue = useMemo(
    () => ({
      isNavbarHidden: !isNavbarVisible,
      setNavbarHidden: setManualNavbarHidden,
    }),
    [isNavbarVisible],
  );

  return (
    <FooterContext.Provider value={footerContextValue}>
      <div className="flex min-h-dvh flex-col justify-between">
        <main className={cn('flex-1', shouldShowNavbar && 'pb-navbar-clearance')}>
          <Outlet />
        </main>

        {isNavbarVisible && <Navbar />}
      </div>
    </FooterContext.Provider>
  );
}
