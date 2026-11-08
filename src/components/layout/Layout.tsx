import { useMemo, useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { useRedirectAfterLogin } from '@/hooks/usePendingRedirect';
import { useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

import { FNB } from './FNB';
import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';
import { useReportNavbarPresence } from './navbarPresence';

// FNB(푸터) 노출 경로 화이트리스트 (필요 시 배열에 경로 추가)
const FNB_SHOW_PATHS = ['/home'];

export function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const [manualFooterHidden, setManualFooterHidden] = useState(false);
  const [manualNavbarHidden, setManualNavbarHidden] = useState(false);
  const isKeyboardOpen = useIsKeyboardOpen();

  // 로그인 후 복귀 경로가 있는 경우 이동 처리
  // ⚠️ 앱 전역 동작이지만 RootLayout 으로 옮기지 않는다. 옮기면 Layout 밖인 로그인 화면(legacy)에서도
  // 실행돼 로그인 흐름이 비정상 작동할 수 있다. 로그인 화면을 새로 만들 때 함께 옮긴다.
  useRedirectAfterLogin();

  // 라운지 글쓰기 페이지 (/lounge/:category/post)
  const isLoungeWritePath = /^\/lounge\/[^/]+\/post$/.test(location.pathname);

  // 하단 네비게이션 바(Navbar) 표시 여부 (홈, 검색, 라운지, 마이)
  const showNavbarPaths = ['/home', '/search', '/lounge'];
  const exactNavbarPaths = ['/my'];

  const isRouteHandleNavbarHidden = matches.some(
    (match) => (match.handle as { hideNavbar?: boolean })?.hideNavbar,
  );

  const shouldShowNavbar =
    (showNavbarPaths.some((path) => location.pathname.startsWith(path)) ||
      exactNavbarPaths.some((path) => location.pathname === path)) &&
    !isLoungeWritePath &&
    !isRouteHandleNavbarHidden &&
    !manualNavbarHidden;

  // 키보드가 열리면 냅바를 숨긴다. 본문 하단 여백은 shouldShowNavbar 기준이라 입력 중에 레이아웃이 흔들리지 않는다
  const isNavbarVisible = shouldShowNavbar && !isKeyboardOpen;
  useReportNavbarPresence(isNavbarVisible);

  // 하단 푸터(FNB) 표시 여부
  const isPathFooterShown =
    FNB_SHOW_PATHS.some((path) => location.pathname.startsWith(path)) && !isLoungeWritePath;

  const isRouteHandleFooterHidden = matches.some(
    (match) => (match.handle as { hideFooter?: boolean })?.hideFooter,
  );

  const shouldShowFooter = isPathFooterShown && !manualFooterHidden && !isRouteHandleFooterHidden;

  // useHideFooter · useHideNavbar 가 context 를 effect 의존성으로 쓰므로 렌더마다 새 객체를 만들지 않는다
  const footerContextValue = useMemo(
    () => ({
      isFooterHidden: !shouldShowFooter,
      setFooterHidden: setManualFooterHidden,
      isNavbarHidden: !isNavbarVisible,
      setNavbarHidden: setManualNavbarHidden,
    }),
    [shouldShowFooter, isNavbarVisible],
  );

  return (
    <FooterContext.Provider value={footerContextValue}>
      <div className="flex min-h-dvh flex-col justify-between">
        <main
          className={cn('flex-1', shouldShowNavbar && !shouldShowFooter && 'pb-navbar-clearance')}
        >
          <Outlet />
        </main>

        {shouldShowFooter && <FNB hasFixedBottomBar={shouldShowNavbar} />}

        {isNavbarVisible && <Navbar />}
      </div>
    </FooterContext.Provider>
  );
}
