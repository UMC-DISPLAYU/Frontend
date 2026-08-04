/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { created, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();
const findPersonalArtwork = (personalArtworkId: number) =>
  mockDb.personalArtworks.find((artwork: any) => artwork.personalArtworkId === personalArtworkId) ??
  mockDb.personalArtworks[0];

export const personalArtworkHandlers = [
  ...paths('/api/v1/personal-artworks').map((path) =>
    http.get(path, () =>
      success('/api/v1/personal-artworks', listResponse(mockDb.personalArtworks)),
    ),
  ),
  ...paths('/api/v1/personal-artworks').map((path) =>
    http.post(path, async ({ request }) => {
      const artwork = {
        ...findPersonalArtwork(1),
        ...(await readJson(request)),
        personalArtworkId: Date.now(),
        createdAt: now(),
        updatedAt: now(),
      };
      mockDb.personalArtworks.unshift(artwork);

      return created('/api/v1/personal-artworks', artwork);
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/personal-artworks/{personalArtworkId}',
        findPersonalArtwork(toNumber(params.personalArtworkId, 1)),
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const artwork = findPersonalArtwork(toNumber(params.personalArtworkId, 1));
      Object.assign(artwork, await readJson(request), { updatedAt: now() });

      return success('/api/v1/personal-artworks/{personalArtworkId}', artwork);
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}').map((path) =>
    http.delete(path, () => noContent('/api/v1/personal-artworks/{personalArtworkId}')),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/like').map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/personal-artworks/{personalArtworkId}/like',
        okStatus(toNumber(params.personalArtworkId), true),
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/like').map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/personal-artworks/{personalArtworkId}/like',
        okStatus(toNumber(params.personalArtworkId), false),
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings').map((path) =>
    http.get(path, () =>
      success('/api/v1/personal-artworks/{personalArtworkId}/feelings', { feelings: [] }),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings').map((path) =>
    http.post(path, async ({ request }) =>
      created('/api/v1/personal-artworks/{personalArtworkId}/feelings', {
        personalFeelingId: Date.now(),
        feelingId: Date.now(),
        ...(await readJson(request)),
        createdAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}').map(
    (path) =>
      http.delete(path, () =>
        noContent('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}'),
      ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/like').map(
    (path) =>
      http.post(path, ({ params }) =>
        success('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/like', {
          personalFeelingId: toNumber(params.personalFeelingId),
          isLiked: true,
          likeCount: 1,
        }),
      ),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/replies',
  ).map((path) =>
    http.get(path, () =>
      success(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/replies',
        {
          replies: [],
          nextCursorId: null,
          size: 0,
          hasNext: false,
        },
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply').map(
    (path) =>
      http.post(path, async ({ request }) =>
        created(
          '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply',
          {
            personalFeelingReplyId: Date.now(),
            ...(await readJson(request)),
            createdAt: now(),
          },
        ),
      ),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}',
  ).map((path) =>
    http.delete(path, () =>
      noContent(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}',
      ),
    ),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}/like',
  ).map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}/like',
        {
          personalFeelingReplyId: toNumber(params.personalFeelingReplyId),
          isLiked: true,
          likeCount: 1,
        },
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions').map((path) =>
    http.get(path, () =>
      success('/api/v1/personal-artworks/{personalArtworkId}/questions', { questions: [] }),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions').map((path) =>
    http.post(path, async ({ request }) =>
      created('/api/v1/personal-artworks/{personalArtworkId}/questions', {
        personalQuestionId: Date.now(),
        questionId: Date.now(),
        ...(await readJson(request)),
        createdAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}').map(
    (path) =>
      http.delete(path, () =>
        noContent('/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}'),
      ),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
  ).map((path) =>
    http.post(path, async ({ request }) =>
      created(
        '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
        {
          personalQuestionReplyId: Date.now(),
          ...(await readJson(request)),
          createdAt: now(),
        },
      ),
    ),
  ),
];
