import { createBrowserRouter, LoaderFunctionArgs, Navigate } from 'react-router-dom';

import { AuthGuard } from './components/guards/AuthGuard';
import {
  ArtistPermissionGuard,
  ArtworkPermissionGuard,
  DisplayContentPermissionGuard,
  DisplayCreatePermissionGuard,
  DisplayInvitationPermissionGuard,
  DisplayPermissionGuard,
  FlowRoute,
  GuardedFlowStep,
  PersonalArtworkPermissionGuard,
} from './components/guards/RoutePermissionGuards';
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
import { ForbiddenPage } from './pages/ForbiddenPage';
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

const artworkRegisterFlowSteps = [
  {
    path: '/artworks/add/choice',
    step: 'artwork-choice',
  },
  {
    path: '/artworks/add/artist',
    step: 'artwork-author-select',
    required: ['artwork-choice'],
    fallback: '/artworks/add/choice',
  },
  {
    path: '/artworks/add/artist/direct',
    step: 'artwork-author-direct',
    required: ['artwork-choice'],
    fallback: '/artworks/add/choice',
  },
  {
    path: '/artworks/add/basic',
    step: 'artwork-basic',
    required: ['artwork-choice'],
    fallback: '/artworks/add/choice',
  },
  {
    path: '/artworks/add/participants',
    step: 'artwork-participants',
    required: ['artwork-basic'],
    fallback: '/artworks/add/choice',
  },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 🔓 공개 라우트 (비로그인 게스트 접근 가능)
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'home', element: <Homepage /> },
      { path: 'search', element: <SearchPage /> },
      {
        path: 'artist/:userId',
        loader: validateNumericId('userId'),
        errorElement: <NotFound />,
        element: <AuthPage />,
      },
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
      { path: '403', element: <ForbiddenPage /> },

      // 🔒 보호된 라우트 (인증 필요 - AuthGuard Layout 적용)
      {
        element: <AuthGuard />,
        children: [
          { path: 'my', element: <MyPage /> },
          { path: 'artist-verification', element: <ArtistVerificationPage /> },

          // 내 전시 관리 목록
          {
            path: 'my/exhibitions',
            element: (
              <ArtistPermissionGuard>
                <MyExhibitionsPage />
              </ArtistPermissionGuard>
            ),
          },

          // 1. 전시 등록 플로우
          {
            element: (
              <FlowRoute initialFlow="exhibition-register">
                <DisplayCreatePermissionGuard>
                  <ExhibitionRegisterDraftRoute />
                </DisplayCreatePermissionGuard>
              </FlowRoute>
            ),
            children: [
              {
                path: 'exhibition/register',
                element: (
                  <GuardedFlowStep required={[]} fallback="/exhibition/register" complete="start">
                    <ExhibitionRegister />
                  </GuardedFlowStep>
                ),
              },
              {
                path: 'exhibition/register/basic',
                element: (
                  <GuardedFlowStep
                    required={['start']}
                    fallback="/exhibition/register"
                    complete="basic"
                  >
                    <ExhibitionBasicInfo />
                  </GuardedFlowStep>
                ),
              },
              {
                path: 'exhibition/register/artist',
                element: (
                  <GuardedFlowStep
                    required={['basic']}
                    fallback="/exhibition/register/basic"
                    complete="artist"
                  >
                    <ArtistNameSetup />
                  </GuardedFlowStep>
                ),
              },
            ],
          },

          // 2. 특정 전시 관리 플로우 (ID 발급 후)
          {
            path: 'exhibition/:displayId',
            loader: validateNumericId('displayId'),
            errorElement: <NotFound />,
            element: (
              <FlowRoute initialFlow="exhibition-edit">
                <ExhibitionRegisterDraftRoute />
              </FlowRoute>
            ),
            children: [
              {
                path: 'manage',
                element: (
                  <DisplayPermissionGuard action="edit">
                    <ExhibitionManage />
                  </DisplayPermissionGuard>
                ),
              },
              {
                path: 'work',
                element: (
                  <ArtworkPermissionGuard action="create">
                    <ExhibitionWorkPage />
                  </ArtworkPermissionGuard>
                ),
              },
              {
                path: 'edit',
                element: (
                  <DisplayPermissionGuard action="edit">
                    <GuardedFlowStep required={[]} fallback="../edit" complete="edit-start">
                      <ExhibitionRegister />
                    </GuardedFlowStep>
                  </DisplayPermissionGuard>
                ),
              },
              {
                path: 'edit/basic',
                element: (
                  <DisplayPermissionGuard action="edit">
                    <GuardedFlowStep
                      required={['edit-start']}
                      fallback="../edit"
                      complete="edit-basic"
                    >
                      <ExhibitionBasicInfo />
                    </GuardedFlowStep>
                  </DisplayPermissionGuard>
                ),
              },
              {
                path: 'team',
                element: (
                  <DisplayInvitationPermissionGuard action="create">
                    <TeamManage />
                  </DisplayInvitationPermissionGuard>
                ),
              },
              {
                path: 'visibility',
                element: (
                  <DisplayPermissionGuard action="edit">
                    <VisibilitySettings />
                  </DisplayPermissionGuard>
                ),
              },
              {
                path: 'contents',
                element: (
                  <DisplayContentPermissionGuard action="createContent">
                    <DisplayContentsManagePage />
                  </DisplayContentPermissionGuard>
                ),
              },
              {
                path: 'contents/:categoryId',
                element: (
                  <DisplayContentPermissionGuard action="editContent">
                    <InteriorPhotosPage />
                  </DisplayContentPermissionGuard>
                ),
              },
              {
                path: 'artworks',
                element: (
                  <FlowRoute initialFlow="artwork-register" steps={artworkRegisterFlowSteps} />
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworksManagePage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: 'add',
                    element: <Navigate to="choice" replace />,
                  },
                  {
                    path: 'add/choice',
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: 'add/artist',
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: 'add/artist/direct',
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: 'add/basic',
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: 'add/participants',
                    element: (
                      <ArtworkPermissionGuard action="create">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                  {
                    path: ':artworkId/edit',
                    loader: validateNumericId('artworkId'),
                    errorElement: <NotFound />,
                    element: (
                      <ArtworkPermissionGuard action="edit">
                        <ArtworkRegisterPage />
                      </ArtworkPermissionGuard>
                    ),
                  },
                ],
              },
              {
                path: 'complete',
                element: (
                  <DisplayPermissionGuard action="edit">
                    <ExhibitionRegisterComplete />
                  </DisplayPermissionGuard>
                ),
              },
            ],
          },

          { path: 'setting', element: <SettingPage /> },
          { path: 'edit-basic-info', element: <EditBasicInfoPage /> },
          {
            path: 'edit-artist-profile',
            element: (
              <ArtistPermissionGuard>
                <EditArtistProfilePage />
              </ArtistPermissionGuard>
            ),
          },
          {
            path: 'personal-artworks/register',
            element: (
              <PersonalArtworkPermissionGuard action="create">
                <PersonalArtworksRegister />
              </PersonalArtworkPermissionGuard>
            ),
          },
          {
            path: 'personal-artworks/complete',
            element: (
              <PersonalArtworkPermissionGuard action="create">
                <ExhibitionRegisterComplete />
              </PersonalArtworkPermissionGuard>
            ),
          },
          {
            path: 'answer-questions',
            element: (
              <ArtistPermissionGuard>
                <AnswerPage />
              </ArtistPermissionGuard>
            ),
          },
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
