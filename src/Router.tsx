import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AuthMyPage } from './pages/AuthMyPage';
import { AuthPage } from './pages/AuthPage';
import { Homepage } from './pages/Homepage';
import { Mypage } from './pages/MyPage';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'my', element: <Mypage /> },
      { path: 'authmy', element: <AuthMyPage /> },
      { path: 'auth', element: <AuthPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
