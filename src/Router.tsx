import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Layout } from './components/layout';
import { AuthPage } from './pages/AuthPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { LoungeBoardDetailPage } from './pages/LoungeBoardDetailPage';
import { LoungeBoardPage } from './pages/LoungeBoardPage';
import { LoungePage } from './pages/LoungePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyPage } from './pages/MyPage';
import { NotFound } from './pages/NotFound';
import { OnboardingPage } from './pages/OnboardingPage';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/onboarding" replace /> },
      { path: 'home', element: <Homepage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
      { path: 'lounge/my-activity', element: <MyActivityPage /> },
      { path: 'lounge/:category', element: <LoungeBoardPage /> },
      { path: 'lounge/:category/:id', element: <LoungeBoardDetailPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
