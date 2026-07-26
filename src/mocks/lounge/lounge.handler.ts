import { http } from 'msw';

import { createSuccessJson, cursorPageInfo } from '@/mocks/response';

import {
  mockLoungeCommentsByPostId,
  mockLoungePostDetails,
  mockLoungePosts,
  mockLoungeReplies,
} from './lounge.mock';

export const loungeHandlers = [
  http.get('*/v1/lounge/posts', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const size = Number(url.searchParams.get('size') ?? mockLoungePosts.length);
    const posts = mockLoungePosts.filter((post) => (category ? post.category === category : true));

    return createSuccessJson(url.pathname, {
      posts: posts.slice(0, size),
      ...cursorPageInfo(size),
    });
  }),

  http.get('*/v1/lounge/posts/:postId', ({ params, request }) => {
    const postId = Number(params.postId);

    return createSuccessJson(
      new URL(request.url).pathname,
      mockLoungePostDetails[postId] ?? mockLoungePostDetails[1],
    );
  }),

  http.get('*/v1/lounge/posts/:postId/comments', ({ params, request }) => {
    const url = new URL(request.url);
    const postId = Number(params.postId);
    const comments = mockLoungeCommentsByPostId[postId] ?? [];
    const size = Number(url.searchParams.get('size') ?? comments.length);

    return createSuccessJson(url.pathname, {
      comments: comments.slice(0, size),
      ...cursorPageInfo(size),
    });
  }),

  http.get('*/v1/lounge/comments/:commentId/replies', ({ request }) => {
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? mockLoungeReplies.length);

    return createSuccessJson(url.pathname, {
      replies: mockLoungeReplies.slice(0, size),
      ...cursorPageInfo(size),
    });
  }),
];
