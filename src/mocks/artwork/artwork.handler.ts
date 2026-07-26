import { http } from 'msw';

import { MOCK_ARTWORKS_BY_DISPLAY_ID } from '@/mocks/data';
import { createSuccessJson, cursorPageInfo } from '@/mocks/response';

import {
  getMockArtworkDetail,
  mockArtworkFeelings,
  mockArtworkPreviewItems,
  mockArtworkQuestions,
} from './artwork.mock';

export const artworkHandlers = [
  http.get('*/v1/artworks', ({ request }) => {
    const url = new URL(request.url);
    const displayId = Number(url.searchParams.get('displayId') ?? 101);
    const artworks = MOCK_ARTWORKS_BY_DISPLAY_ID[displayId] ?? [];

    return createSuccessJson(url.pathname, {
      artworks: artworks.map((artwork) => ({
        artworkId: artwork.artworkId,
        artworkName: artwork.title,
        artistName: artwork.artist,
        artworkImageUrl: artwork.images[0].imageUrl,
        imageWidth: artwork.images[0].width,
        imageHeight: artwork.images[0].height,
      })),
    });
  }),

  http.get('*/v1/artworks/preview', ({ request }) => {
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? mockArtworkPreviewItems.length);

    return createSuccessJson(url.pathname, {
      artworks: mockArtworkPreviewItems.slice(0, size),
      page: Number(url.searchParams.get('page') ?? 0),
      size,
      isLast: true,
    });
  }),

  http.get('*/v1/artworks/:artworkId', ({ params, request }) =>
    createSuccessJson(new URL(request.url).pathname, getMockArtworkDetail(Number(params.artworkId))),
  ),

  http.get('*/v1/artworks/:artworkId/feelings', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, {
      feelings: mockArtworkFeelings,
      ...cursorPageInfo(mockArtworkFeelings.length),
    }),
  ),

  http.get('*/v1/artworks/:artworkId/questions', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, {
      questions: mockArtworkQuestions,
      ...cursorPageInfo(mockArtworkQuestions.length),
    }),
  ),
];
