import { Outlet } from 'react-router-dom';

import { FNB } from './FNB';
import { Header } from './Header';
import { useHeaderContext } from './headerContext';
import { HeaderProvider } from './HeaderProvider';

function LayoutContent() {
  const { header } = useHeaderContext();

  return (
    <>
      <Header title={header.title} left={header.left} right={header.right} />
      <main>
        <Outlet />
      </main>
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
