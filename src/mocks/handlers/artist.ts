import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, paths, readJson } from '@/mocks/response';

export const artistHandlers = paths('/api/v1/artists/me/artist-profile').map((path) =>
  http.post(path, async ({ request }) =>
    created('/api/v1/artists/me/artist-profile', {
      artistId: 1,
      userId: mockDb.me.userId,
      nickname: mockDb.me.nickname,
      profileImageUrl: mockDb.me.profileImageUrl,
      ...(await readJson(request)),
      status: 'ACTIVE',
    }),
  ),
);
