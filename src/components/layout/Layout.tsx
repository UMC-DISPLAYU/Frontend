import { useState } from 'react';

import { Outlet, useLocation, useMatches } from 'react-router-dom';

import { FNB } from './FNB';
import { FooterContext } from './FooterContext';
import { Navbar } from './Navbar';

function LayoutContent() {
  const location = useLocation();
  const matches = useMatches();
  const [manualFooterHidden, setManualFooterHidden] = useState(false);

  // 하단 네비게이션 바(Navbar) 숨김 경로
  const hideNavbarPaths = [
    '/display/',
    '/artwork/',
    '/artist-verification',
    '/exhibition-register/',
    '/lounge/review/post',
  ];
  const shouldHideNavbar = hideNavbarPaths.some((path) => location.pathname.startsWith(path));

  // Footer(FNB) 선택적 숨김 경로 (기본값: Footer 표시, 안 보일 특수 페이지 등록 가능)
  const defaultHideFooterPaths = [
    '/artist-verification',
    '/exhibition-register/',
    '/lounge/review/post',
  ];
  const isPathFooterHidden = defaultHideFooterPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // Router handle ({ hideFooter: true }) 기반 숨김
  const isRouteHandleFooterHidden = matches.some(
    (match) => (match.handle as { hideFooter?: boolean })?.hideFooter,
  );

  const shouldHideFooter = manualFooterHidden || isPathFooterHidden || isRouteHandleFooterHidden;

  return (
    <FooterContext.Provider
      value={{
        isFooterHidden: shouldHideFooter,
        setFooterHidden: setManualFooterHidden,
      }}
    >
      <div className="min-h-screen flex flex-col justify-between">
        <main className={`flex-1 ${shouldHideNavbar ? '' : 'pb-3'}`}>
          <Outlet />
        </main>

        {/* 기본적으로 Footer(FNB) 노출, 선택적으로 안보이도록 설정 가능 */}
        {!shouldHideFooter && <FNB hasFixedBottomBar={shouldHideNavbar} />}

        {!shouldHideNavbar && (
          <div className="fixed right-0 bottom-4 left-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto">
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
