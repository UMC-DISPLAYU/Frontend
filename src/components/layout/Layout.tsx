import { useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { useRedirectAfterLogin } from '@/hooks/usePendingRedirect';

import { FNB } from './FNB';
import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';

function LayoutContent() {
  const location = useLocation();
  const matches = useMatches();
  const [manualFooterHidden, setManualFooterHidden] = useState(false);

  /* 로그인 전에 보관해 둔 복귀 경로가 있으면 로그인 직후 그곳으로 보냅니다. */
  useRedirectAfterLogin();

  // 라운지 글쓰기 페이지 (/lounge/:category/post, 카테고리 무관)
  const isLoungeWritePath = /^\/lounge\/[^/]+\/post$/.test(location.pathname);

  // 하단 네비게이션 바(Navbar) 표시 경로 (화이트리스트)
  const showNavbarPaths = ['/home', '/search', '/lounge'];
  const exactNavbarPaths = ['/my']; // 정확히 일치해야 하는 경로
  const hideNavbarPaths = ['/lounge/my-questions']; // 예외: startsWith로 매칭되지만 숨김

  // Router handle ({ hideNavbar: true }) 기반 숨김 (예: 라운지 게시판 상세 페이지)
  const isRouteHandleNavbarHidden = matches.some(
    (match) => (match.handle as { hideNavbar?: boolean })?.hideNavbar,
  );

  const shouldShowNavbar =
    (showNavbarPaths.some((path) => location.pathname.startsWith(path)) ||
      exactNavbarPaths.some((path) => location.pathname === path)) &&
    !hideNavbarPaths.some((path) => location.pathname.startsWith(path)) &&
    !isLoungeWritePath &&
    !isRouteHandleNavbarHidden;

  // Footer(FNB) 표시 경로 (화이트리스트)
  const showFooterPaths = ['/home', '/search', '/lounge'];
  const exactFooterPaths = ['/my']; // 정확히 일치해야 하는 경로
  const hideFooterPaths = ['/lounge/my-questions']; // 예외: startsWith로 매칭되지만 숨김

  const isPathFooterShown =
    (showFooterPaths.some((path) => location.pathname.startsWith(path)) ||
      exactFooterPaths.some((path) => location.pathname === path)) &&
    !hideFooterPaths.some((path) => location.pathname.startsWith(path)) &&
    !isLoungeWritePath;

  // Router handle ({ hideFooter: true }) 기반 숨김
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
      <div className="min-h-screen flex flex-col justify-between">
        <main className={`flex-1 ${shouldShowNavbar ? 'pb-3' : ''}`}>
          <Outlet />
        </main>

        {/* Footer(FNB)는 홈/탐색/라운지/마이에서만 표시 */}
        {shouldShowFooter && <FNB hasFixedBottomBar={shouldShowNavbar} />}

        {/* Navbar는 홈/탐색/라운지/마이에서만 표시 */}
        {shouldShowNavbar && (
          <div className="fixed right-0 bottom-4 left-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-96 flex justify-center">
              <Navbar />
            </div>
          </div>
        )}
      </div>
    </FooterContext.Provider>
  );
}

export function Layout() {
  return <LayoutContent />;
}
