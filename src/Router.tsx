import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';
import ExhibitionRegister from './pages/ExhibitionRegister';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
    ],
  },
  {
    path: 'exhibition-register',
    element: <ExhibitionRegister />
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
