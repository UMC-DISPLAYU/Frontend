import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArchivePage } from './pages/ArchivePage';
import { AuthPage } from './pages/AuthPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { ExhibitionReviewDetailPage } from './pages/ExhibitionReviewDetailPage';
import { ExhibitionReviewPage } from './pages/ExhibitionReviewPage';
import { Homepage } from './pages/Homepage';
import { LoungePage } from './pages/LoungePage';
import { MyPage } from './pages/MyPage';
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
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
      { path: 'lounge/review', element: <ExhibitionReviewPage /> },
      { path: 'lounge/review/:id', element: <ExhibitionReviewDetailPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
