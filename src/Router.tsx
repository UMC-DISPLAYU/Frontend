import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { App } from './App';
import { NotFound } from './NotFound';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
