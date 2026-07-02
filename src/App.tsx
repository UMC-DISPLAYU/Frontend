import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { NotFound } from './NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <main />, //main 태그
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
