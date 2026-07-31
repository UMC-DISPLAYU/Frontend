import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Layout } from './components/layout';
import { AnswerPage } from './pages/AnswerPage';
import { ArtistNameSetup } from './pages/ArtistNameSetup';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { ArtworkRegisterPage } from './pages/ArtworkRegisterPage';
import { ArtworksManagePage } from './pages/ArtworksManagePage';
import { AuthPage } from './pages/AuthPage';
import { DisplayAcceptPage } from './pages/DisplayAcceptPage';
import { DisplayArtistNamePage } from './pages/DisplayArtistNamePage';
import { DisplayContentsManagePage } from './pages/DisplayContentsManagePage';
import { DisplayContentsPage } from './pages/DisplayContentsPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { DisplayManagePage } from './pages/DisplayManagePage';
import { EditArtistProfilePage } from './pages/EditArtistProfilePage';
import { EditBasicInfoPage } from './pages/EditBasicInfoPage';
import { ExhibitionManage } from './pages/ExhibitioionManagePage';
import { ExhibitionBasicInfo } from './pages/ExhibitionBasicInfoPage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { ExhibitionReviewWritePage } from './pages/ExhibitionReviewWritePage';
import { Homepage } from './pages/Homepage';
import { InvitationRequestPage } from './pages/InvitationRequestPage';
import { LoginPage } from './pages/LoginPage';
import { LoungeBoardDetailPage } from './pages/LoungeBoardDetailPage';
import { LoungeBoardPage } from './pages/LoungeBoardPage';
import { LoungePage } from './pages/LoungePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyPage } from './pages/MyPage';
import { MyQuestionsPage } from './pages/MyQuestionsPage';
import { MyReviewPage } from './pages/MyReviewPage';
import { NotFound } from './pages/NotFound';
import { OnboardingPage } from './pages/OnboardingPage';
import { PolicyPage } from './pages/PolicyPage';
import { SearchPage } from './pages/SearchPage';
import { SettingPage } from './pages/Settingpage';
import { TeamManage } from './pages/TeamManagePage';
import { VisibilitySettings } from './pages/VisibilitysettingsPage';
import { ExhibitionRegisterComplete } from './pages/RegisterCompletePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'home', element: <Homepage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'artwork/:artworkId', element: <ArtworkDetailPage /> },
      { path: 'display/:id/contents', element: <DisplayContentsPage /> },
      { path: 'display/manage', element: <DisplayManagePage /> },
      { path: 'display/contents-manage', element: <DisplayContentsManagePage /> },
      { path: 'artworks-manage', element: <ArtworksManagePage /> },
      { path: 'artworks-register', element: <ArtworkRegisterPage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'exhibition/register-complete', element: <ExhibitionRegisterComplete /> },
      { path: 'lounge', element: <LoungePage /> },
      { path: 'exhibition/basic', element: <ExhibitionBasicInfo /> },
      { path: 'exhibition/artist', element: <ArtistNameSetup /> },
      { path: 'exhibition/manage', element: <ExhibitionManage /> },
      { path: 'exhibition/visibility', element: <VisibilitySettings /> },
      { path: 'team/manage', element: <TeamManage /> },
      { path: 'setting', element: <SettingPage /> },
      { path: 'edit-basic-info', element: <EditBasicInfoPage /> },
      { path: 'edit-artist-profile', element: <EditArtistProfilePage /> },
      { path: 'answer-questions', element: <AnswerPage /> },
      { path: 'invitation-request', element: <InvitationRequestPage /> },
      { path: 'invitations/:id/artist-name', element: <DisplayArtistNamePage /> },
      { path: 'invitations/:id/complete', element: <DisplayAcceptPage /> },
      { path: 'my-review', element: <MyReviewPage /> },
      { path: 'my-questions', element: <MyQuestionsPage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: 'lounge/review/post', element: <ExhibitionReviewWritePage /> },
      { path: 'lounge/my-activity', element: <MyActivityPage /> },
      { path: 'lounge/:category', element: <LoungeBoardPage /> },
      { path: 'lounge/:category/:id', element: <LoungeBoardDetailPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '/login',
    element: <LoginPage />,
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
