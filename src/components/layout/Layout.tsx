import { useEffect, useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { useRedirectAfterLogin } from '@/hooks/usePendingRedirect';
import { cn } from '@/utils/cn';

import { FNB } from './FNB';
import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';

// FNB(푸터) 노출 경로 화이트리스트 (필요 시 배열에 경로 추가)
const FNB_SHOW_PATHS = ['/home'];

export function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const [manualFooterHidden, setManualFooterHidden] = useState(false);

  // 로그인 후 복귀 경로가 있는 경우 이동 처리
  useRedirectAfterLogin();

  // 페이지 전환 시 화면 스크롤 위치 최상단 리셋
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.overflow-y-auto').forEach((el) => {
      el.scrollTop = 0;
    });
  }, [location.pathname]);

  // 라운지 글쓰기 페이지 (/lounge/:category/post)
  const isLoungeWritePath = /^\/lounge\/[^/]+\/post$/.test(location.pathname);

  // 하단 네비게이션 바(Navbar) 표시 여부 (홈, 검색, 라운지, 마이)
  const showNavbarPaths = ['/home', '/search', '/lounge'];
  const exactNavbarPaths = ['/my'];
  const hideNavbarPaths = ['/lounge/my-questions'];

  const isRouteHandleNavbarHidden = matches.some(
    (match) => (match.handle as { hideNavbar?: boolean })?.hideNavbar,
  );

  const shouldShowNavbar =
    (showNavbarPaths.some((path) => location.pathname.startsWith(path)) ||
      exactNavbarPaths.some((path) => location.pathname === path)) &&
    !hideNavbarPaths.some((path) => location.pathname.startsWith(path)) &&
    !isLoungeWritePath &&
    !isRouteHandleNavbarHidden;

  // 하단 푸터(FNB) 표시 여부
  const isPathFooterShown =
    FNB_SHOW_PATHS.some((path) => location.pathname.startsWith(path)) && !isLoungeWritePath;

  const isRouteHandleFooterHidden = matches.some(
    (match) => (match.handle as { hideFooter?: boolean })?.hideFooter,
  );

  const shouldShowFooter = isPathFooterShown && !manualFooterHidden && !isRouteHandleFooterHidden;

  return (
    <FooterContext.Provider
      value={{
        isFooterHidden: !shouldShowFooter,
        setFooterHidden: setManualFooterHidden,
      }}
    >
      <div className="flex min-h-screen flex-col justify-between">
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
