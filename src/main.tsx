import './styles/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from './queryClient';
import { router } from './Router';

const enableMocking = async () => {
  if (import.meta.env.VITE_ENABLE_MOCK !== 'true') {
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

const renderApp = async () => {
  const ReactQueryDevtools = import.meta.env.DEV
    ? (await import('@tanstack/react-query-devtools')).ReactQueryDevtools
    : null;

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {ReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </React.StrictMode>,
  );
};

enableMocking()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  })
  .finally(() => {
    void renderApp();
  });
