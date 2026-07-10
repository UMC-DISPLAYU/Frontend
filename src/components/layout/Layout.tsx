import { Outlet, useLocation } from 'react-router-dom';

import { FNB } from './FNB';
import { HeaderProvider } from './HeaderProvider';
import { Navbar } from './Navbar';

function LayoutContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/display/', '/artwork/', '/exhibition-register'];
  const shouldHideNavbar = hideNavbarPaths.some((path) => location.pathname.startsWith(path));

  return (
    <>
      <main>
        <Outlet />
      </main>
      {!shouldHideNavbar && (
        <div className="fixed right-0 bottom-[34px] left-0 z-50 flex justify-center px-4">
          <Navbar />
        </div>
      )}
      <FNB />
    </>
  );
}

export function Layout() {
  return (
    <HeaderProvider>
      <LayoutContent />
    </HeaderProvider>
  );
}
