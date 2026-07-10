import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
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
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
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
