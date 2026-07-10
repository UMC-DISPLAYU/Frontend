import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'search', element: <SearchPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
