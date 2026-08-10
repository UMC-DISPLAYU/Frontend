import { Outlet } from 'react-router-dom';

import { ExhibitionRegisterDraftProvider } from '@/contexts/ExhibitionRegisterDraftContext';

export function ExhibitionRegisterDraftRoute() {
  return (
    <ExhibitionRegisterDraftProvider>
      <Outlet />
    </ExhibitionRegisterDraftProvider>
  );
}
