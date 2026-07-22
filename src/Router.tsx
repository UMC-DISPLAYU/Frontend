import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AuthPage } from './pages/AuthPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { LoungePage } from './pages/LoungePage';
import { MyPage } from './pages/MyPage';
import { NotFound } from './pages/NotFound';
import  SettingPage from './pages/Settingpage';
import EditBasicInfoPage from './pages/EditBasicInfoPage';
import EditArtistProfilePage from './pages/EditArtistProfilePage';
import AnswerQuestions from './pages/AnswerPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
      { path: 'setting', element: <SettingPage /> },
      { path: 'edit-basic-info', element: <EditBasicInfoPage /> },
      { path: 'edit-artist-profile', element: <EditArtistProfilePage /> },
      { path: 'answer-questions', element: <AnswerQuestions /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
