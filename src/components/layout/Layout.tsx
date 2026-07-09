import { Outlet, useLocation } from 'react-router-dom';

import { FNB } from './FNB';
import { Header } from './Header';
import { useHeaderContext } from './headerContext';
import { HeaderProvider } from './HeaderProvider';
import { Navbar } from './Navbar';

function LayoutContent() {
  const { header } = useHeaderContext();
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/exhibition/');

  return (
    <>
      {/* <Header title={header.title} left={header.left} right={header.right} /> */}
      <main>
        <Outlet />
      </main>
      {!isDetailPage && (
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
