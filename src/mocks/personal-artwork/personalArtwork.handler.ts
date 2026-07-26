import { http } from 'msw';

import { createSuccessJson } from '@/mocks/response';

import { mockPersonalArtworkSummaries } from './personalArtwork.mock';

export const personalArtworkHandlers = [
  http.get('*/v1/personal-artworks', ({ request }) => {
    const url = new URL(request.url);

    return createSuccessJson(url.pathname, mockPersonalArtworkSummaries);
  }),
];

