import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { LoungePage } from './pages/LoungePage';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
