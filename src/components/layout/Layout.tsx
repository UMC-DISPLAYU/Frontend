import { Outlet, useLocation } from 'react-router-dom';

import { FNB } from './FNB';
import { Navbar } from './Navbar';

function LayoutContent() {
  const location = useLocation();
  const hideChromePaths = [
    '/display/',
    '/artwork/',
    '/artworks-manage',
    '/artworks-register',
    '/exhibition/',
    '/exhibition-register/',
    '/team/manage',
    '/lounge/review/post',
  ];
  const shouldHideChrome = hideChromePaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className={`flex-1 ${shouldHideChrome ? '' : 'pb-20 md:pb-24 lg:pb-28'}`}>
        <Outlet />
      </main>
      {!shouldHideChrome && <FNB />}
      {!shouldHideChrome && (
        <div className="fixed right-0 bottom-4 sm:bottom-6 md:bottom-8 left-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <Navbar />
          </div>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  return <LayoutContent />;
}
