import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'artwork/:artworkId', element: <ArtworkDetailPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
