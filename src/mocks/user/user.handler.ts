import { http } from 'msw';

import { createSuccessJson } from '@/mocks/response';

import { mockMyArtistProfile, mockUserMe } from './user.mock';

export const userHandlers = [
  http.get('*/v1/users/nickname/check', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname') ?? '';

    return createSuccessJson(url.pathname, {
      nickname,
      isAvailable: !['admin', 'displayu', 'test'].includes(nickname.trim().toLowerCase()),
    });
  }),

  http.get('*/v1/users/me', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockUserMe),
  ),

  http.get('*/v1/users/me/artist-profile', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockMyArtistProfile),
  ),
];
