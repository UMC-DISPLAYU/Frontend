import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
