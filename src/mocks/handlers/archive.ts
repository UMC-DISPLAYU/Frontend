import { http } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const archiveList = <TItem extends { [key: string]: unknown }>(items: TItem[]) =>
  listResponse(items);

export const archiveHandlers = [
  ...paths('/api/v1/archives/artists').map((path) =>
    http.get(path, () =>
      success(
        '/api/v1/archives/artists',
        archiveList([{ savedArtistId: 1, artistId: 1, nickname: '디스플레이유' }]),
      ),
    ),
  ),
  ...paths('/api/v1/archives/artists/{artistId}').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/archives/artists/{artistId}', okStatus(toNumber(params.artistId), true)),
    ),
  ),
  ...paths('/api/v1/archives/artists/{artistId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/archives/artists/{artistId}', okStatus(toNumber(params.artistId), false)),
    ),
  ),
  ...paths('/api/v1/archives/artists/{savedArtistId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/archives/artists/{savedArtistId}', {
        savedArtistId: toNumber(params.savedArtistId),
        artistId: toNumber(params.savedArtistId),
        nickname: '디스플레이유',
      }),
    ),
  ),
  ...paths('/api/v1/archives/artworks').map((path) =>
    http.get(path, () => success('/api/v1/archives/artworks', archiveList(mockDb.artworks))),
  ),
  ...paths('/api/v1/archives/artworks/{artworkId}').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/archives/artworks/{artworkId}', okStatus(toNumber(params.artworkId), true)),
    ),
  ),
  ...paths('/api/v1/archives/artworks/{artworkId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/archives/artworks/{artworkId}', okStatus(toNumber(params.artworkId), false)),
    ),
  ),
  ...paths('/api/v1/archives/artworks/{savedArtworkId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/archives/artworks/{savedArtworkId}',
        mockDb.artworks[toNumber(params.savedArtworkId, 1) - 1] ?? mockDb.artworks[0],
      ),
    ),
  ),
  ...paths('/api/v1/archives/artworks/{archiveWorkId}/memo').map((path) =>
    http.put(path, async ({ params, request }) =>
      success('/api/v1/archives/artworks/{archiveWorkId}/memo', {
        archiveWorkId: toNumber(params.archiveWorkId),
        ...(await readJson(request)),
      }),
    ),
  ),
  ...paths('/api/v1/archives/artworks/{archiveWorkId}/memo').map((path) =>
    http.delete(path, () => noContent('/api/v1/archives/artworks/{archiveWorkId}/memo')),
  ),
  ...paths('/api/v1/archives/exhibitions').map((path) =>
    http.get(path, () => success('/api/v1/archives/exhibitions', archiveList(mockDb.displays))),
  ),
  ...paths('/api/v1/archives/exhibitions/{exhibitionId}').map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/archives/exhibitions/{exhibitionId}',
        okStatus(toNumber(params.exhibitionId), true),
      ),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{exhibitionId}').map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/archives/exhibitions/{exhibitionId}',
        okStatus(toNumber(params.exhibitionId), false),
      ),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{savedExhibitionId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/archives/exhibitions/{savedExhibitionId}',
        mockDb.displays[toNumber(params.savedExhibitionId, 1) - 1] ?? mockDb.displays[0],
      ),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}/memo').map((path) =>
    http.put(path, async ({ params, request }) =>
      success('/api/v1/archives/exhibitions/{archiveDisplayId}/memo', {
        archiveDisplayId: toNumber(params.archiveDisplayId),
        ...(await readJson(request)),
      }),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}/memo').map((path) =>
    http.delete(path, () => noContent('/api/v1/archives/exhibitions/{archiveDisplayId}/memo')),
  ),
];
