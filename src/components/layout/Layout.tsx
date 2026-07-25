import { Outlet, useLocation } from 'react-router-dom';

import { FNB } from './FNB';
import { Navbar } from './Navbar';

function LayoutContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/display/', '/artwork/', '/exhibition-register/'];
  const shouldHideNavbar = hideNavbarPaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1 pb-6 md:pb-8">
        <Outlet />
      </main>
      <FNB />
      {!shouldHideNavbar && (
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
