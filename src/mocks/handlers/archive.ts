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
  displays: mockDb.displays.map((display: any) => ({
    archiveDisplayId: display.displayId,
    displayId: display.displayId,
    title: display.title,
    posterImageUrl: getFirstImageUrl(display),
    organization: display.organization,
    department: display.department ?? '',
    location: display.placeName,
    startedAt: display.startDate ?? display.startedAt,
    endedAt: display.endDate ?? display.endedAt,
    status: display.status,
    memo: display.memo ?? null,
    savedAt: '2026-08-02T00:00:00.000Z',
    userId: 1,
  })),
  nextCursorId: null,
  size: mockDb.displays.length,
  hasNext: false,
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

const updateDisplayArchiveStatus = (displayId: number, isArchived: boolean) => {
  const display = mockDb.displays.find((item: any) => item.displayId === displayId);

  if (display) {
    Object.assign(display, { archived: isArchived, isArchived });
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
      const body = await readJson<{ content?: string }>(request);
      const memo = body.content ?? '';
      updateArtworkMemo(archiveWorkId, memo);

      return success('/api/v1/archives/artworks/{archiveWorkId}/memo', {
        archiveWorkId,
        memo,
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
    http.post(path, ({ params }) => {
      const exhibitionId = toNumber(params.exhibitionId);

      updateDisplayArchiveStatus(exhibitionId, true);

      return success('/api/v1/archives/exhibitions/{exhibitionId}', okStatus(exhibitionId, true));
    }),
  ),
  ...paths('/api/v1/archives/exhibitions/{exhibitionId}').map((path) =>
    http.delete(path, ({ params }) => {
      const exhibitionId = toNumber(params.exhibitionId);

      updateDisplayArchiveStatus(exhibitionId, false);

      return success('/api/v1/archives/exhibitions/{exhibitionId}', okStatus(exhibitionId, false));
    }),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/archives/exhibitions/{archiveDisplayId}',
        archivedExhibitions().displays.find(
          (display: { archiveDisplayId: number }) =>
            display.archiveDisplayId === toNumber(params.archiveDisplayId, 1),
        ) ?? archivedExhibitions().displays[0],
      ),
    ),
  ),
  ...paths('/api/v1/archives/exhibitions/{archiveDisplayId}/memo').map((path) =>
    http.put(path, async ({ params, request }) => {
      const archiveDisplayId = toNumber(params.archiveDisplayId);
      const body = await readJson<{ content?: string }>(request);
      const memo = body.content ?? '';
      updateDisplayMemo(archiveDisplayId, memo);

      return success('/api/v1/archives/exhibitions/{archiveDisplayId}/memo', {
        archiveDisplayId,
        memo,
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
