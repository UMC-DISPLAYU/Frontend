import './styles/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import { router } from './Router';

const enableMocking = async () => {
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK !== 'true') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  return worker.start({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/v1/')) {
        print.warning();
      }
    },
  });
};

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
};

enableMocking()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  })
  .finally(renderApp);
