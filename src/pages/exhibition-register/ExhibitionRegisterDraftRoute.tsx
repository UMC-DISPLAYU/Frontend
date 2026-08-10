import { Outlet } from 'react-router-dom';

import { ExhibitionRegisterDraftProvider } from '@/contexts/exhibitionRegisterDraftContext';

export function ExhibitionRegisterDraftRoute() {
  return (
    <ExhibitionRegisterDraftProvider>
      <Outlet />
    </ExhibitionRegisterDraftProvider>
  );
}
