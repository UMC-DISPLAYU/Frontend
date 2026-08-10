import { createBrowserRouter, LoaderFunctionArgs, Navigate } from 'react-router-dom';

import { PrivateRoute } from './components/auth/PrivateRoute';
import { Layout } from './components/layout';
import { AnswerPage } from './pages/AnswerPage';
import { ArtistVerificationPage } from './pages/artist-verification';
import { EditArtistProfilePage } from './pages/artist-verification';
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
import { EditBasicInfoPage } from './pages/EditBasicInfoPage';
import {
  ArtistNameSetup,
  ExhibitionBasicInfo,
  ExhibitionRegister,
} from './pages/exhibition-register';
import { ExhibitionRegisterDraftRoute } from './pages/exhibition-register/ExhibitionRegisterDraftRoute';
import { ExhibitionManage } from './pages/ExhibitionManagePage';
import { ExhibitionReviewWritePage } from './pages/ExhibitionReviewWritePage';
import { ExhibitionWorkPage } from './pages/ExhibitionWorkPage';
import { Homepage } from './pages/Homepage';
import { InteriorPhotosPage } from './pages/InteriorPhotosPage';
import { InvitationRequestPage } from './pages/InvitationRequestPage';
import { LoginPage } from './pages/LoginPage';
import { LoungeBoardDetailPage } from './pages/LoungeBoardDetailPage';
import { LoungeBoardPage } from './pages/LoungeBoardPage';
import { LoungePage } from './pages/LoungePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyExhibitionsPage } from './pages/MyExhibitionsPage';
import { MyPage } from './pages/MyPage';
import { MyQuestionsPage } from './pages/MyQuestionsPage';
import { MyReviewPage } from './pages/MyReviewPage';
import { NotFound } from './pages/NotFound';
import { OnboardingPage } from './pages/onboarding';
import { PersonalArtworkDetailPage } from './pages/PersonalArtworkDetailPage';
import { PersonalArtworksRegister } from './pages/PersonalArtworksRegister';
import { PolicyPage } from './pages/PolicyPage';
import { ExhibitionRegisterComplete } from './pages/RegisterCompletePage';
import { SearchPage } from './pages/SearchPage';
import { SettingPage } from './pages/Settingpage';
import { TeamManage } from './pages/TeamManagePage';
import { VisibilitySettings } from './pages/VisibilitySettingsPage';

const validateNumericId =
  (paramName: string) =>
  ({ params }: LoaderFunctionArgs) => {
    const idNum = Number(params[paramName]);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      throw new Response('Not Found', { status: 404 });
    }
    return null;
  };

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
      {
        path: 'display/:id',
        loader: validateNumericId('id'),
        errorElement: <NotFound />,
        element: <DisplayDetailPage />,
      },
      {
        path: 'artwork/:artworkId',
        loader: validateNumericId('artworkId'),
        errorElement: <NotFound />,
        element: <ArtworkDetailPage />,
      },
      {
        path: 'display/:id/contents',
        loader: validateNumericId('id'),
        errorElement: <NotFound />,
        element: <DisplayContentsPage />,
      },
      { path: 'lounge', element: <LoungePage /> },
      /* 개인 작품 상세는 비회원도 열람할 수 있습니다. */
      {
        path: 'personal-artworks/:personalArtworkId',
        loader: validateNumericId('personalArtworkId'),
        errorElement: <NotFound />,
        element: <PersonalArtworkDetailPage />,
      },
      { path: 'lounge/:category', element: <LoungeBoardPage /> },
      {
        path: 'lounge/:category/:id',
        loader: validateNumericId('id'),
        errorElement: <NotFound />,
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

          // 내 전시 관리 목록
          { path: 'my/exhibitions', element: <MyExhibitionsPage /> },
          { path: 'artworks-register', element: <ArtworkRegisterPage /> },

          // 1. 전시 등록 플로우
          {
            element: <ExhibitionRegisterDraftRoute />,
            children: [
              { path: 'exhibition/register', element: <ExhibitionRegister /> },
              { path: 'exhibition/register/basic', element: <ExhibitionBasicInfo /> },
              { path: 'exhibition/register/artist', element: <ArtistNameSetup /> },
            ],
          },

          // 2. 특정 전시 관리 플로우 (ID 발급 후)
          {
            path: 'exhibition/:displayId',
            loader: validateNumericId('displayId'),
            errorElement: <NotFound />,
            element: <ExhibitionRegisterDraftRoute />,
            children: [
              { path: 'manage', element: <ExhibitionManage /> },
              { path: 'work', element: <ExhibitionWorkPage /> },
              { path: 'edit', element: <ExhibitionRegister /> },
              { path: 'edit/basic', element: <ExhibitionBasicInfo /> },
              { path: 'team', element: <TeamManage /> },
              { path: 'visibility', element: <VisibilitySettings /> },
              { path: 'contents', element: <DisplayContentsManagePage /> },
              { path: 'contents/:categoryId', element: <InteriorPhotosPage /> },
              { path: 'artworks', element: <ArtworksManagePage /> },
              { path: 'artworks/add', element: <ArtworkRegisterPage /> },
              { path: 'artworks/:artworkId/edit', element: <ArtworkRegisterPage /> },
              { path: 'complete', element: <ExhibitionRegisterComplete /> },
            ],
          },

          { path: 'setting', element: <SettingPage /> },
          { path: 'edit-basic-info', element: <EditBasicInfoPage /> },
          { path: 'edit-artist-profile', element: <EditArtistProfilePage /> },
          { path: 'personal-artworks/register', element: <PersonalArtworksRegister /> },
          { path: 'personal-artworks/complete', element: <ExhibitionRegisterComplete /> },
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
