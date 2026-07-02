import { createBrowserRouter } from 'react-router-dom';

import { Homepage } from './pages/Homepage';
import { NotFound } from './pages/NotFound';
import { App } from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Homepage /> },
      // 새 페이지는 여기에 추가
      // { path: 'about', element: <About /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
