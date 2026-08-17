import { lazy, Suspense } from 'react';

import { createBrowserRouter, LoaderFunctionArgs, Navigate } from 'react-router-dom';

import { RootRedirect } from './components/auth/RootRedirect';
import { LoadingView } from './components/common';
import { AuthGuard } from './components/guards/AuthGuard';
import {
  ArtistPermissionGuard,
  ArtworkPermissionGuard,
  DisplayArtistNamePermissionGuard,
  DisplayContentPermissionGuard,
  DisplayCreatePermissionGuard,
  DisplayInvitationPermissionGuard,
  DisplayPermissionGuard,
  FlowRoute,
  GuardedFlowStep,
  PersonalArtworkPermissionGuard,
} from './components/guards/RoutePermissionGuards';
import { Layout } from './components/layout';

const lazyPage = <T extends Record<string, unknown>>(
  importFn: () => Promise<T>,
  exportName: keyof T,
) => {
  const LazyComponent = lazy(() =>
    importFn().then((mod) => ({
      default: mod[exportName] as unknown as React.ComponentType,
    })),
  );

  const PageComponent = () => (
    <Suspense fallback={<LoadingView />}>
      <LazyComponent />
    </Suspense>
  );

  PageComponent.displayName = `LazyPage(${String(exportName)})`;

  return PageComponent;
};

// Lazy loaded page components
const Homepage = lazyPage(() => import('./pages/Homepage'), 'Homepage');
const SearchPage = lazyPage(() => import('./pages/SearchPage'), 'SearchPage');
const AuthPage = lazyPage(() => import('./pages/AuthPage'), 'AuthPage');
const DisplayDetailPage = lazyPage(() => import('./pages/DisplayDetailPage'), 'DisplayDetailPage');
const ArtworkDetailPage = lazyPage(() => import('./pages/ArtworkDetailPage'), 'ArtworkDetailPage');
const DisplayContentsPage = lazyPage(
  () => import('./pages/DisplayContentsPage'),
  'DisplayContentsPage',
);
const LoungePage = lazyPage(() => import('./pages/LoungePage'), 'LoungePage');
const PersonalArtworkDetailPage = lazyPage(
  () => import('./pages/PersonalArtworkDetailPage'),
  'PersonalArtworkDetailPage',
);
const LoungeBoardPage = lazyPage(() => import('./pages/LoungeBoardPage'), 'LoungeBoardPage');
const LoungeBoardDetailPage = lazyPage(
  () => import('./pages/LoungeBoardDetailPage'),
  'LoungeBoardDetailPage',
);
const PolicyPage = lazyPage(() => import('./pages/PolicyPage'), 'PolicyPage');
const ForbiddenPage = lazyPage(() => import('./pages/ForbiddenPage'), 'ForbiddenPage');
const MyPage = lazyPage(() => import('./pages/MyPage'), 'MyPage');
const ArtistVerificationPage = lazyPage(
  () => import('./pages/artist-verification'),
  'ArtistVerificationPage',
);
const EditArtistProfilePage = lazyPage(
  () => import('./pages/artist-verification'),
  'EditArtistProfilePage',
);
const MyExhibitionsPage = lazyPage(() => import('./pages/MyExhibitionsPage'), 'MyExhibitionsPage');
const ExhibitionRegister = lazyPage(
  () => import('./pages/exhibition-register'),
  'ExhibitionRegister',
);
const ExhibitionBasicInfo = lazyPage(
  () => import('./pages/exhibition-register'),
  'ExhibitionBasicInfo',
);
const ArtistNameSetup = lazyPage(() => import('./pages/exhibition-register'), 'ArtistNameSetup');
const ExhibitionRegisterDraftRoute = lazyPage(
  () => import('./pages/exhibition-register/ExhibitionRegisterDraftRoute'),
  'ExhibitionRegisterDraftRoute',
);
const ExhibitionManage = lazyPage(() => import('./pages/ExhibitionManagePage'), 'ExhibitionManage');
const ExhibitionReviewWritePage = lazyPage(
  () => import('./pages/ExhibitionReviewWritePage'),
  'ExhibitionReviewWritePage',
);
const ExhibitionWorkPage = lazyPage(
  () => import('./pages/ExhibitionWorkPage'),
  'ExhibitionWorkPage',
);
const DisplayArtistNamePage = lazyPage(
  () => import('./pages/DisplayArtistNamePage'),
  'DisplayArtistNamePage',
);
const DisplayContentsManagePage = lazyPage(
  () => import('./pages/DisplayContentsManagePage'),
  'DisplayContentsManagePage',
);
const ArtworksManagePage = lazyPage(
  () => import('./pages/ArtworksManagePage'),
  'ArtworksManagePage',
);
const ArtworkRegisterPage = lazyPage(
  () => import('./pages/artwork-register'),
  'ArtworkRegisterPage',
);
const InteriorPhotosPage = lazyPage(
  () => import('./pages/InteriorPhotosPage'),
  'InteriorPhotosPage',
);
const TeamManage = lazyPage(() => import('./pages/TeamManagePage'), 'TeamManage');
const VisibilitySettings = lazyPage(
  () => import('./pages/VisibilitySettingsPage'),
  'VisibilitySettings',
);
const DisplayAcceptPage = lazyPage(() => import('./pages/DisplayAcceptPage'), 'DisplayAcceptPage');
const SettingPage = lazyPage(() => import('./pages/Settingpage'), 'SettingPage');
const EditBasicInfoPage = lazyPage(() => import('./pages/EditBasicInfoPage'), 'EditBasicInfoPage');
const PersonalArtworksRegister = lazyPage(
  () => import('./pages/personal-artworks-register'),
  'PersonalArtworksRegister',
);
const AnswerPage = lazyPage(() => import('./pages/AnswerPage'), 'AnswerPage');
const InvitationRequestPage = lazyPage(
  () => import('./pages/InvitationRequestPage'),
  'InvitationRequestPage',
);
const MyQuestionsPage = lazyPage(() => import('./pages/MyQuestionsPage'), 'MyQuestionsPage');
const MyReviewPage = lazyPage(() => import('./pages/MyReviewPage'), 'MyReviewPage');
const MyActivityPage = lazyPage(() => import('./pages/MyActivityPage'), 'MyActivityPage');
const OnboardingPage = lazyPage(() => import('./pages/onboarding'), 'OnboardingPage');
const LoginPage = lazyPage(() => import('./pages/LoginPage'), 'LoginPage');
const DisplayInvitationLinkPage = lazyPage(
  () => import('./pages/DisplayInvitationLinkPage'),
  'DisplayInvitationLinkPage',
);
const ExhibitionRegisterComplete = lazyPage(
  () => import('./pages/RegisterCompletePage'),
  'ExhibitionRegisterComplete',
);
const NotFound = lazyPage(() => import('./pages/NotFound'), 'NotFound');

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
      { index: true, element: <RootRedirect /> },
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
            element: <MyExhibitionsPage />,
          },

          // 1. 전시 등록 플로우
          {
            element: (
              <FlowRoute captureEntryHistoryIndex initialFlow="exhibition-register">
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
                  <DisplayPermissionGuard action="view">
                    <ExhibitionWorkPage />
                  </DisplayPermissionGuard>
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
                path: 'edit/artist',
                element: (
                  <DisplayArtistNamePermissionGuard action="edit">
                    <ArtistNameSetup />
                  </DisplayArtistNamePermissionGuard>
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
                  <DisplayContentPermissionGuard action="createContent">
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
                  <ArtworkPermissionGuard action="create">
                    <ExhibitionRegisterComplete />
                  </ArtworkPermissionGuard>
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
