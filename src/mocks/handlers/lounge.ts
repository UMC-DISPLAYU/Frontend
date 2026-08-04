/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { created, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();
const findPost = (postId: number) =>
  mockDb.loungePosts.find((post: any) => post.loungePostId === postId || post.postId === postId) ??
  mockDb.loungePosts[0];

export const loungeHandlers = [
  ...paths('/api/v1/lounge/posts').map((path) =>
    http.get(path, () => success('/api/v1/lounge/posts', listResponse(mockDb.loungePosts))),
  ),
  ...paths('/api/v1/lounge/posts').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const post = {
        ...findPost(1),
        ...body,
        loungePostId: Date.now(),
        postId: Date.now(),
        writer: mockDb.me,
        author: mockDb.me,
        createdAt: now(),
        updatedAt: now(),
      };
      mockDb.loungePosts.unshift(post);

      return created('/api/v1/lounge/posts', post);
    }),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/lounge/posts/{loungePostId}', findPost(toNumber(params.loungePostId, 1))),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const post = findPost(toNumber(params.loungePostId, 1));
      Object.assign(post, await readJson(request), { updatedAt: now() });

      return success('/api/v1/lounge/posts/{loungePostId}', post);
    }),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/lounge/posts/{loungePostId}', {
        loungePostId: toNumber(params.loungePostId),
        deletedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/likes').map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/lounge/posts/{loungePostId}/likes',
        okStatus(toNumber(params.loungePostId), true),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/likes').map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/lounge/posts/{loungePostId}/likes',
        okStatus(toNumber(params.loungePostId), false),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/scraps').map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/lounge/posts/{loungePostId}/scraps',
        okStatus(toNumber(params.loungePostId), true),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/scraps').map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/lounge/posts/{loungePostId}/scraps',
        okStatus(toNumber(params.loungePostId), false),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/comments').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/lounge/posts/{loungePostId}/comments', {
        comments: mockDb.loungeComments.filter(
          (comment: any) => comment.loungePostId === toNumber(params.loungePostId, 1),
        ),
        nextCursorId: null,
        size: mockDb.loungeComments.length,
        hasNext: false,
      }),
    ),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}/comments').map((path) =>
    http.post(path, async ({ params, request }) => {
      const comment = {
        loungeCommentId: Date.now(),
        commentId: Date.now(),
        loungePostId: toNumber(params.loungePostId, 1),
        parentCommentId: null,
        ...(await readJson(request)),
        writer: mockDb.me,
        author: mockDb.me,
        createdAt: now(),
        updatedAt: now(),
      };
      mockDb.loungeComments.unshift(comment);

      return created('/api/v1/lounge/posts/{loungePostId}/comments', comment);
    }),
  ),
  ...paths('/api/v1/lounge/comments/{loungeCommentId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/lounge/comments/{loungeCommentId}', {
        loungeCommentId: toNumber(params.loungeCommentId),
        deletedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/lounge/comments/{loungeCommentId}/likes').map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/lounge/comments/{loungeCommentId}/likes',
        okStatus(toNumber(params.loungeCommentId), true),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/comments/{loungeCommentId}/likes').map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/lounge/comments/{loungeCommentId}/likes',
        okStatus(toNumber(params.loungeCommentId), false),
      ),
    ),
  ),
  ...paths('/api/v1/lounge/comments/{parentCommentId}/replies').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/lounge/comments/{parentCommentId}/replies', {
        replies: mockDb.loungeComments.filter(
          (comment: any) => comment.parentCommentId === toNumber(params.parentCommentId),
        ),
        nextCursorId: null,
        size: 0,
        hasNext: false,
      }),
    ),
  ),
  ...paths('/api/v1/lounge/comments/{parentCommentId}/replies').map((path) =>
    http.post(path, async ({ params, request }) =>
      created('/api/v1/lounge/comments/{parentCommentId}/replies', {
        loungeCommentId: Date.now(),
        parentCommentId: toNumber(params.parentCommentId),
        ...(await readJson(request)),
        writer: mockDb.me,
        author: mockDb.me,
        createdAt: now(),
      }),
    ),
  ),
];
