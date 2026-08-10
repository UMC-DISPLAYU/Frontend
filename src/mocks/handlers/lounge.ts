/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { created, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();
const findPost = (postId: number) =>
  mockDb.loungePosts.find((post: any) => post.loungePostId === postId || post.postId === postId);

export const loungeHandlers = [
  ...paths('/api/v1/lounge/posts').map((path) =>
    http.get(path, () => success('/api/v1/lounge/posts', listResponse(mockDb.loungePosts))),
  ),
  ...paths('/api/v1/lounge/posts').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const post = {
        ...mockDb.loungePosts[0],
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
    http.get(path, ({ params }) => {
      const post = findPost(toNumber(params.loungePostId, 1));
      if (!post) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      return success('/api/v1/lounge/posts/{loungePostId}', post);
    }),
  ),
  ...paths('/api/v1/lounge/posts/{loungePostId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const post = findPost(toNumber(params.loungePostId, 1));
      if (!post) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
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
      const postId = toNumber(params.loungePostId, 1);
      const post = findPost(postId);
      if (!post) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      post.commentCount = (post.commentCount ?? 0) + 1;
      const comment = {
        loungeCommentId: Date.now(),
        commentId: Date.now(),
        loungePostId: postId,
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
    http.delete(path, ({ params }) => {
      const commentId = toNumber(params.loungeCommentId);
      const comment = mockDb.loungeComments.find(
        (c: any) => c.loungeCommentId === commentId || c.commentId === commentId,
      );
      if (comment) {
        const post = findPost(comment.loungePostId);
        if (post && (post.commentCount ?? 0) > 0) {
          post.commentCount = post.commentCount - 1;
        }
        mockDb.loungeComments = mockDb.loungeComments.filter(
          (c: any) => c.loungeCommentId !== commentId && c.commentId !== commentId,
        );
      }
      return success('/api/v1/lounge/comments/{loungeCommentId}', {
        loungeCommentId: commentId,
        deletedAt: now(),
      });
    }),
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
    http.post(path, async ({ params, request }) => {
      const parentId = toNumber(params.parentCommentId);
      const parentComment = mockDb.loungeComments.find(
        (c: any) => c.loungeCommentId === parentId || c.commentId === parentId,
      );
      if (parentComment) {
        const post = findPost(parentComment.loungePostId);
        if (!post) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        post.commentCount = (post.commentCount ?? 0) + 1;
      } else {
        return HttpResponse.json({ message: 'Parent comment not found' }, { status: 404 });
      }
      const reply = {
        loungeCommentId: Date.now(),
        parentCommentId: parentId,
        ...(await readJson(request)),
        writer: mockDb.me,
        author: mockDb.me,
        createdAt: now(),
      };
      mockDb.loungeComments.unshift(reply);
      return created('/api/v1/lounge/comments/{parentCommentId}/replies', reply);
    }),
  ),
];
