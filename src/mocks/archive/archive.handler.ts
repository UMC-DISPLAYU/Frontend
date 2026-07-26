import { http } from 'msw';

import { createSuccessJson, cursorPageInfo } from '@/mocks/response';

import {
  mockArchivedArtists,
  mockArchivedArtworks,
  mockArchivedExhibitions,
} from './archive.mock';

export const archiveHandlers = [
  http.get('*/v1/archives/exhibitions', ({ request }) => {
    const url = new URL(request.url);

    return createSuccessJson(url.pathname, {
      displays: mockArchivedExhibitions,
      ...cursorPageInfo(mockArchivedExhibitions.length),
    });
  }),

  http.get('*/v1/archives/artworks', ({ request }) => {
    const url = new URL(request.url);

    return createSuccessJson(url.pathname, {
      works: mockArchivedArtworks,
      ...cursorPageInfo(mockArchivedArtworks.length),
    });
  }),

  http.get('*/v1/archives/artists', ({ request }) => {
    const url = new URL(request.url);

    return createSuccessJson(url.pathname, {
      artists: mockArchivedArtists,
      ...cursorPageInfo(mockArchivedArtists.length),
    });
  }),
];

