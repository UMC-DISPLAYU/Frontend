import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AuthPage } from './pages/AuthPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import DisplayManagePage from './pages/DisplayManagePage';
import { ExhibitionRegister} from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { LoungePage } from './pages/LoungePage';
import { MyPage } from './pages/MyPage';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'display/manage', element: <DisplayManagePage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
