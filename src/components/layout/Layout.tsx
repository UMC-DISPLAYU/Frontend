import { Outlet } from 'react-router-dom';

import { FNB } from './FNB';
import { Header } from './Header';

export function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <FNB />
    </>
  );
}
