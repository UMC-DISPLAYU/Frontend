/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb, okStatus } from '@/mocks/data/repository';
import { noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const getFirstImageUrl = (item: any) =>
  item.thumbnailUrl ??
  item.posterImageUrl ??
  item.profileImageUrl ??
  item.imageUrl ??
  item.images?.[0]?.imageUrl ??
  item.posterImages?.[0]?.imageUrl ??
  '';

const archivedExhibitions = () => ({
  savedExhibitions: mockDb.displays.map((display: any) => ({
    savedExhibitionId: display.displayId,
    displayId: display.displayId,
    title: display.title,
    thumbnailUrl: getFirstImageUrl(display),
    organization: display.organization,
    placeName: display.placeName,
    startDate: display.startDate ?? display.startedAt,
    endDate: display.endDate ?? display.endedAt,
    displayType: display.displayType,
    status: display.status,
    memo: display.memo ?? null,
    savedAt: '2026-08-02T00:00:00.000Z',
  })),
});

const archivedArtworks = () => ({
  works: [
    ...mockDb.artworks.map((artwork: any) => ({
      archiveWorkId: artwork.artworkId,
      artworkId: artwork.artworkId,
      personalArtworkId: null,
      userId: 1,
      title: artwork.title,
      artist: artwork.artist ?? artwork.artistName,
      thumbnailUrl: getFirstImageUrl(artwork),
      memo: artwork.memo ?? null,
      savedAt: '2026-08-02T00:00:00.000Z',
    })),
    ...mockDb.personalArtworks.map((artwork: any, index: number) => ({
      archiveWorkId: -(index + 1),
      artworkId: null,
      personalArtworkId: artwork.personalArtworkId,
      userId: artwork.userId,
      title: artwork.artworkName,
      artist: artwork.nickname ?? '',
      thumbnailUrl: getFirstImageUrl(artwork),
      memo: artwork.memo ?? null,
      savedAt: '2026-08-03T00:00:00.000Z',
    })),
  ],
  nextCursorId: null,
  hasNext: false,
  size: mockDb.artworks.length + mockDb.personalArtworks.length,
});

/* 저장한 작가는 mockDb.savedArtistIds를 기준으로 만듭니다. */
const archivedArtists = () => ({
  artists: mockDb.savedArtistIds.map((artistId: number, index: number) => ({
    archiveArtistId: index + 1,
    artistId,
    userId: mockDb.me.userId,
    artistName:
      artistId === mockDb.me.userId
        ? mockDb.me.nickname
        : (mockDb.artworks.find((artwork: any) => artwork.artistUserId === artistId)?.artistName ??
          ''),
    fields: ['시각디자인'],
    profileImageUrl: '',
    artworkCount: mockDb.artworks.length,
    exhibitionCount: mockDb.displays.length,
    savedAt: '2026-08-02T00:00:00.000Z',
  })),
  nextCursorId: null,
  size: mockDb.savedArtistIds.length,
  hasNext: false,
});

const updateDisplayMemo = (archiveDisplayId: number, memo: string | null) => {
  const display = mockDb.displays.find((item: any) => item.displayId === archiveDisplayId);
  if (display) {
    Object.assign(display, { memo });
  }
};

const updateArtworkMemo = (archiveWorkId: number, memo: string | null) => {
  const artwork = mockDb.artworks.find((item: any) => item.artworkId === archiveWorkId);
  if (artwork) {
    Object.assign(artwork, { memo });
  }
};

export const archiveHandlers = [
  ...paths('/api/v1/archives/artists').map((path) =>
    http.get(path, () => success('/api/v1/archives/artists', archivedArtists())),
  ),
  /* 저장 여부를 화면에서 확인할 수 있도록 mockDb에 실제로 반영합니다. */
  ...paths('/api/v1/archives/artists/{artistId}').map((path) =>
    http.post(path, ({ params }) => {
      const artistId = toNumber(params.artistId);

      if (!mockDb.savedArtistIds.includes(artistId)) mockDb.savedArtistIds.push(artistId);

      return success('/api/v1/archives/artists/{artistId}', okStatus(artistId, true));
    }),
  ),
  ...paths('/api/v1/archives/artists/{artistId}').map((path) =>
    http.delete(path, ({ params }) => {
      const artistId = toNumber(params.artistId);

      mockDb.savedArtistIds = mockDb.savedArtistIds.filter((id: number) => id !== artistId);

      return success('/api/v1/archives/artists/{artistId}', okStatus(artistId, false));
    }),
  ),
  ...paths('/api/v1/archives/artists/{savedArtistId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/archives/artists/{savedArtistId}', {
        ...archivedArtists().artists[0],
        archiveArtistId: toNumber(params.savedArtistId),
        artistId: toNumber(params.savedArtistId),
      }),
    ),
  ),
  ...paths('/api/v1/archives/artworks').map((path) =>
    http.get(path, () => success('/api/v1/archives/artworks', archivedArtworks())),
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
        archivedArtworks().works[toNumber(params.savedArtworkId, 1) - 1] ??
          archivedArtworks().works[0],
      ),
    ),
  ),
  ...paths('/api/v1/archives/artworks/{archiveWorkId}/memo').map((path) =>
    http.put(path, async ({ params, request }) => {
      const archiveWorkId = toNumber(params.archiveWorkId);
      const body = await readJson<{ memo?: string }>(request);
      const memo = body.memo ?? '';
      updateArtworkMemo(archiveWorkId, memo);

      return success('/api/v1/archives/artworks/{archiveWorkId}/memo', {
        archiveWorkId,
        ...body,
      });
    }),
  ),
  ...paths('/api/v1/archives/artworks/{archiveWorkId}/memo').map((path) =>
    http.delete(path, ({ params }) => {
      updateArtworkMemo(toNumber(params.archiveWorkId), null);

      return noContent('/api/v1/archives/artworks/{archiveWorkId}/memo');
    }),
  ),
  ...paths('/api/v1/archives/personal-artworks/{personalArtworkId}').map((path) =>
    http.post(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);

      mockDb.archivedPersonalArtworkIds.add(personalArtworkId);

      return success('/api/v1/archives/personal-artworks/{personalArtworkId}', {
        personalArtworkId,
        isArchived: true,
      });
    }),
  ),
  ...paths('/api/v1/archives/personal-artworks/{personalArtworkId}').map((path) =>
    http.delete(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);

      mockDb.archivedPersonalArtworkIds.delete(personalArtworkId);

      return success('/api/v1/archives/personal-artworks/{personalArtworkId}', {
        personalArtworkId,
        isArchived: false,
      });
    }),
  ),
  ...paths('/api/v1/archives/exhibitions').map((path) =>
    http.get(path, () => success('/api/v1/archives/exhibitions', archivedExhibitions())),
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
        archivedExhibitions().savedExhibitions[toNumber(params.savedExhibitionId, 1) - 1] ??
          archivedExhibitions().savedExhibitions[0],
      ),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}/memo').map((path) =>
    http.put(path, async ({ params, request }) => {
      const archiveDisplayId = toNumber(params.archiveDisplayId);
      const body = await readJson<{ memo?: string }>(request);
      const memo = body.memo ?? '';
      updateDisplayMemo(archiveDisplayId, memo);

      return success('/api/v1/archives/exhibitions/{archiveDisplayId}/memo', {
        archiveDisplayId,
        ...body,
      });
    }),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}/memo').map((path) =>
    http.delete(path, ({ params }) => {
      updateDisplayMemo(toNumber(params.archiveDisplayId), null);

      return noContent('/api/v1/archives/exhibitions/{archiveDisplayId}/memo');
    }),
  ),
];
