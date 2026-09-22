import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/apiError';
import { isRequestCanceled } from '@/utils/error';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isRequestCanceled(error) || failureCount >= 1) {
          return false;
        }

        if (error instanceof ApiError) {
          return !error.status || error.status >= 500;
        }

        return true;
      },
      staleTime: 1000 * 60,
    },
  },
});
