import { http } from 'msw';

import { paths, success } from '@/mocks/response';

export const healthHandlers = paths('/api/v1/health').map((path) =>
  http.get(path, () => success('/api/v1/health', { status: 'UP' })),
);
