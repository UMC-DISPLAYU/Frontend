import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AnswerPage } from './pages/AnswerPage';
import { AuthPage } from './pages/AuthPage';
import { DisplayAcceptPage } from './pages/DisplayAcceptPage';
import { DisplayArtistNamePage } from './pages/DisplayArtistNamePage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { EditArtistProfilePage } from './pages/EditArtistProfilePage';
import { EditBasicInfoPage } from './pages/EditBasicInfoPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { InvitationRequestPage } from './pages/InvitationRequestPage';
import { LoungePage } from './pages/LoungePage';
import { MyPage } from './pages/MyPage';
import { MyQuestionsPage } from './pages/MyQuestionsPage';
import { MyReviewPage } from './pages/MyReviewPage';
import { MyRoungePage } from './pages/MyRoungePage';
import { NotFound } from './pages/NotFound';
import PolicyPage from './pages/PolicyPage';
import { SettingPage } from './pages/Settingpage';

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
      { path: 'answer-questions', element: <AnswerPage /> },
      { path: 'invitation-request', element: <InvitationRequestPage /> },
      { path: 'invitations/:id/artist-name', element: <DisplayArtistNamePage /> },
      { path: 'invitations/:id/complete', element: <DisplayAcceptPage /> },
      { path: 'my-questions', element: <MyQuestionsPage /> },
      { path: 'my-review', element: <MyReviewPage /> },
      { path: 'my-lounge', element: <MyRoungePage /> },
      { path: 'policy', element: <PolicyPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
