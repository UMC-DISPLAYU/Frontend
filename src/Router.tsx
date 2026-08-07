import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PrivateRoute } from './components/auth/PrivateRoute';
import { Layout } from './components/layout';
import { AnswerPage } from './pages/AnswerPage';
import { ArtistNameSetup } from './pages/ArtistNameSetup';
import { ArtistVerificationPage } from './pages/ArtistVerificationPage';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { ArtworkRegisterPage } from './pages/ArtworkRegisterPage';
import { ArtworksManagePage } from './pages/ArtworksManagePage';
import { AuthPage } from './pages/AuthPage';
import { DisplayAcceptPage } from './pages/DisplayAcceptPage';
import { DisplayArtistNamePage } from './pages/DisplayArtistNamePage';
import { DisplayContentsManagePage } from './pages/DisplayContentsManagePage';
import { DisplayContentsPage } from './pages/DisplayContentsPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { DisplayInvitationLinkPage } from './pages/DisplayInvitationLinkPage';
import { DisplayManagePage } from './pages/DisplayManagePage';
import { EditArtistProfilePage } from './pages/EditArtistProfilePage';
import { EditBasicInfoPage } from './pages/EditBasicInfoPage';
import { ExhibitionManage } from './pages/ExhibitioionManagePage';
import { ExhibitionBasicInfo } from './pages/ExhibitionBasicInfoPage';
import { ExhibitionEditPage } from './pages/ExhibitionEditPage';
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
import { PersonalArtworkDetailPage } from './pages/PersonalArtworkDetailPage';
import { PersonalArtworksRegister } from './pages/PersonalArtworksRegister';
import { PolicyPage } from './pages/PolicyPage';
import { ExhibitionRegisterComplete } from './pages/RegisterCompletePage';
import { SearchPage } from './pages/SearchPage';
import { SettingPage } from './pages/Settingpage';
import { TeamManage } from './pages/TeamManagePage';
import { VisibilitySettings } from './pages/VisibilitysettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 🔓 공개 라우트 (비로그인 게스트 접근 가능)
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'home', element: <Homepage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/invitation/:token', element: <DisplayInvitationLinkPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'artwork/:artworkId', element: <ArtworkDetailPage /> },
      { path: 'display/:id/contents', element: <DisplayContentsPage /> },
      { path: 'lounge', element: <LoungePage /> },
      /* 개인 작품 상세는 비회원도 열람할 수 있습니다. */
      { path: 'personal-artworks/:personalArtworkId', element: <PersonalArtworkDetailPage /> },
      { path: 'lounge/:category', element: <LoungeBoardPage /> },
      {
        path: 'lounge/:category/:id',
        element: <LoungeBoardDetailPage />,
        handle: { hideNavbar: true },
      },
      { path: 'policy', element: <PolicyPage /> },

      // 🔒 보호된 라우트 (인증 필요 - PrivateRoute Layout 적용)
      {
        element: <PrivateRoute />,
        children: [
          { path: 'my', element: <MyPage /> },
          { path: 'artist-verification', element: <ArtistVerificationPage /> },
          { path: 'display/manage', element: <DisplayManagePage /> },
          { path: 'display/contents-manage', element: <DisplayContentsManagePage /> },
          { path: 'artworks-manage', element: <ArtworksManagePage /> },
          { path: 'artworks-register', element: <ArtworkRegisterPage /> },
          { path: 'exhibition-register', element: <ExhibitionRegister /> },
          { path: 'exhibition/register-complete', element: <ExhibitionRegisterComplete /> },
          { path: 'exhibition/basic', element: <ExhibitionBasicInfo /> },
          { path: 'exhibition/edit/:displayId', element: <ExhibitionEditPage /> },
          { path: 'exhibition/artist', element: <ArtistNameSetup /> },
          { path: 'exhibition/manage', element: <ExhibitionManage /> },
          { path: 'exhibition/visibility', element: <VisibilitySettings /> },
          { path: 'display/:displayId/team/manage', element: <TeamManage /> },
          { path: 'setting', element: <SettingPage /> },
          { path: 'edit-basic-info', element: <EditBasicInfoPage /> },
          { path: 'edit-artist-profile', element: <EditArtistProfilePage /> },
          { path: 'personal-artworks/register', element: <PersonalArtworksRegister /> },
          { path: 'answer-questions', element: <AnswerPage /> },
          { path: 'invitation-request', element: <InvitationRequestPage /> },
          { path: 'invitations/:id/artist-name', element: <DisplayArtistNamePage /> },
          { path: 'invitations/:id/complete', element: <DisplayAcceptPage /> },
          { path: 'my-review', element: <MyReviewPage /> },
          { path: 'my-questions', element: <MyQuestionsPage /> },
          { path: 'lounge/:category/post', element: <ExhibitionReviewWritePage /> },
          { path: 'lounge/my-activity', element: <MyActivityPage /> },
          {
            path: 'lounge/:category/:id/edit',
            element: <ExhibitionReviewWritePage />,
            handle: { hideNavbar: true, hideFooter: true },
          },
        ],
      },
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
