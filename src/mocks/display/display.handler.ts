import { delay, http, HttpResponse } from 'msw';

import type { GetGraduationDisplaysResponseDto } from '@/api/dto';

import { MOCK_EXHIBITIONS } from './display.mock';

const createMeta = (path: string) => ({
  timestamp: new Date().toISOString(),
  path,
});

export const displayHandlers = [
  http.get('/v1/display/graduation', async () => {
    const path = '/v1/display/graduation';

    await delay(300);

    const response: GetGraduationDisplaysResponseDto = {
      resultType: 'SUCCESS',
      success: {
        data: {
          exhibitions: MOCK_EXHIBITIONS,
        },
      },
      error: null,
      meta: createMeta(path),
    };

    return HttpResponse.json(response);
  }),
];
