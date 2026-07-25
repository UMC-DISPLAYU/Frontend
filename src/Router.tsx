import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { ArtistNameSetup } from './pages/ArtistNameSetup';
import ArtworksManagePage from './pages/ArtworksManagePage';
import { AuthPage } from './pages/AuthPage';
import { DisplayDetailPage } from './pages/DisplayDetailPage';
import { DisplayContentsManagePage } from './pages/DisplayContentsManagePage';
import DisplayManagePage from './pages/DisplayManagePage';
import { ExhibitionBasicInfo } from './pages/ExhibitionBasicInfoPage';
import { ExhibitionManage } from './pages/ExhibitioionManagePage';
import { ExhibitionRegister } from './pages/ExhibitionRegister';
import { Homepage } from './pages/Homepage';
import { LoungeBoardDetailPage } from './pages/LoungeBoardDetailPage';
import { LoungeBoardPage } from './pages/LoungeBoardPage';
import { LoungePage } from './pages/LoungePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyPage } from './pages/MyPage';
import { NotFound } from './pages/NotFound';
import { SearchPage } from './pages/SearchPage';
import { TeamManage } from './pages/TeamManagePage';
import { VisibilitySettings } from './pages/VisibilitysettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'my', element: <MyPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'display/:id', element: <DisplayDetailPage /> },
      { path: 'display/manage', element: <DisplayManagePage /> },
      { path: 'display/contents-manage', element: <DisplayContentsManagePage /> },
      { path: 'artworks-manage', element: <ArtworksManagePage /> },
      { path: 'exhibition-register', element: <ExhibitionRegister /> },
      { path: 'lounge', element: <LoungePage /> },
      { path: 'exhibition/basic', element: <ExhibitionBasicInfo /> },
      { path: 'exhibition/artist', element: <ArtistNameSetup /> },
      { path: 'exhibition/manage', element: <ExhibitionManage /> },
      { path: 'exhibition/visibility', element: <VisibilitySettings /> },
      { path: 'team/manage', element: <TeamManage /> },
      { path: 'lounge/my-activity', element: <MyActivityPage /> },
      { path: 'lounge/:category', element: <LoungeBoardPage /> },
      { path: 'lounge/:category/:id', element: <LoungeBoardDetailPage /> },
      // 새 페이지 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
