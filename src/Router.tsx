import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
<<<<<<< HEAD
      { path: 'archive', element: <ArchivePage /> },
=======
      { path: 'search', element: <SearchPage /> },
>>>>>>> 3f2b9be (feat: 탐색 페이지 구현)
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
