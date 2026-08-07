/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();
const findPersonalArtwork = (personalArtworkId: number) =>
  mockDb.personalArtworks.find((artwork: any) => artwork.personalArtworkId === personalArtworkId);
const toggleLike = <TItem extends { isLiked?: boolean; likeCount?: number }>(item?: TItem) => {
  if (!item) return;

  item.isLiked = !item.isLiked;
  item.likeCount = Math.max((item.likeCount ?? 0) + (item.isLiked ? 1 : -1), 0);
};

export const personalArtworkHandlers = [
  ...paths('/api/v1/personal-artworks').map((path) =>
    http.get(path, () => success('/api/v1/personal-artworks', mockDb.personalArtworks)),
  ),
  ...paths('/api/v1/personal-artworks').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson(request);
      const artwork = {
        ...body,
        personalArtworkId: Date.now(),
        userId: mockDb.me.userId,
        nickname: mockDb.me.nickname,
        profileImageUrl: mockDb.me.profileImageUrl,
        isLiked: false,
        likeCount: 0,
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
        findPersonalArtwork(toNumber(params.personalArtworkId)),
      ),
    ),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const artwork = findPersonalArtwork(toNumber(params.personalArtworkId));
      if (artwork) Object.assign(artwork, await readJson(request), { updatedAt: now() });

      return success('/api/v1/personal-artworks/{personalArtworkId}', artwork);
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}').map((path) =>
    http.delete(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);
      mockDb.personalArtworks = mockDb.personalArtworks.filter(
        (artwork: any) => artwork.personalArtworkId !== personalArtworkId,
      );
      mockDb.personalArtworkFeelings = mockDb.personalArtworkFeelings.filter(
        (feeling: any) => feeling.personalArtworkId !== personalArtworkId,
      );
      mockDb.personalArtworkQuestions = mockDb.personalArtworkQuestions.filter(
        (question: any) => question.personalArtworkId !== personalArtworkId,
      );

      return noContent('/api/v1/personal-artworks/{personalArtworkId}');
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/like').map((path) =>
    http.post(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);
      const artwork = findPersonalArtwork(personalArtworkId);
      if (artwork) {
        artwork.isLiked = true;
        artwork.likeCount = Math.max(artwork.likeCount ?? 0, 0) + 1;
      }

      return success('/api/v1/personal-artworks/{personalArtworkId}/like', {
        personalArtworkId,
        isLiked: true,
        likeCount: artwork?.likeCount,
      });
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/like').map((path) =>
    http.delete(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);
      const artwork = findPersonalArtwork(personalArtworkId);
      if (artwork) {
        artwork.isLiked = false;
        artwork.likeCount = Math.max((artwork.likeCount ?? 0) - 1, 0);
      }

      return success('/api/v1/personal-artworks/{personalArtworkId}/like', {
        personalArtworkId,
        isLiked: false,
        likeCount: artwork?.likeCount,
      });
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings').map((path) =>
    http.get(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);

      return success('/api/v1/personal-artworks/{personalArtworkId}/feelings', {
        feelings: mockDb.personalArtworkFeelings.filter(
          (feeling: any) => feeling.personalArtworkId === personalArtworkId,
        ),
      });
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings').map((path) =>
    http.post(path, async ({ params, request }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);
      const feeling = {
        personalFeelingId: Date.now(),
        personalArtworkId,
        userId: mockDb.me.userId,
        nickname: mockDb.me.nickname,
        profileImageUrl: mockDb.me.profileImageUrl,
        ...(await readJson(request)),
        images: [],
        isLiked: false,
        likeCount: 0,
        replyCount: 0,
        createdAt: now(),
      };
      mockDb.personalArtworkFeelings.unshift(feeling);

      return created('/api/v1/personal-artworks/{personalArtworkId}/feelings', feeling);
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}').map(
    (path) =>
      http.delete(path, ({ params }) => {
        const personalFeelingId = toNumber(params.personalFeelingId);
        mockDb.personalArtworkFeelings = mockDb.personalArtworkFeelings.filter(
          (feeling: any) => feeling.personalFeelingId !== personalFeelingId,
        );
        mockDb.personalArtworkFeelingReplies = mockDb.personalArtworkFeelingReplies.filter(
          (reply: any) => reply.personalFeelingId !== personalFeelingId,
        );

        return noContent(
          '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}',
        );
      }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/like').map(
    (path) =>
      http.post(path, ({ params }) => {
        const personalFeelingId = toNumber(params.personalFeelingId);
        const feeling = mockDb.personalArtworkFeelings.find(
          (item: any) => item.personalFeelingId === personalFeelingId,
        );
        if (feeling) {
          feeling.isLiked = !feeling.isLiked;
          feeling.likeCount = Math.max((feeling.likeCount ?? 0) + (feeling.isLiked ? 1 : -1), 0);
        }

        return success(
          '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/like',
          {
            personalFeelingId: toNumber(params.personalFeelingId),
            isLiked: Boolean(feeling?.isLiked),
            likeCount: feeling?.likeCount,
          },
        );
      }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/replies',
  ).map((path) =>
    http.get(path, ({ params }) => {
      const personalFeelingId = toNumber(params.personalFeelingId);
      const replies = mockDb.personalArtworkFeelingReplies.filter(
        (reply: any) => reply.personalFeelingId === personalFeelingId,
      );

      return success(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/replies',
        {
          replies,
          nextCursorId: null,
          size: replies.length,
          hasNext: false,
        },
      );
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply').map(
    (path) =>
      http.post(path, async ({ params, request }) => {
        const personalFeelingId = toNumber(params.personalFeelingId);
        const reply = {
          personalFeelingReplyId: Date.now(),
          personalFeelingId,
          userId: mockDb.me.userId,
          nickname: mockDb.me.nickname,
          isCreator: true,
          ...(await readJson(request)),
          createdAt: now(),
        };
        mockDb.personalArtworkFeelingReplies.push(reply);
        const feeling = mockDb.personalArtworkFeelings.find(
          (item: any) => item.personalFeelingId === personalFeelingId,
        );
        if (feeling) feeling.replyCount = (feeling.replyCount ?? 0) + 1;

        return created(
          '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply',
          reply,
        );
      }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}',
  ).map((path) =>
    http.delete(path, ({ params }) => {
      const personalFeelingId = toNumber(params.personalFeelingId);
      const personalFeelingReplyId = toNumber(params.personalFeelingReplyId);
      mockDb.personalArtworkFeelingReplies = mockDb.personalArtworkFeelingReplies.filter(
        (reply: any) => reply.personalFeelingReplyId !== personalFeelingReplyId,
      );
      const feeling = mockDb.personalArtworkFeelings.find(
        (item: any) => item.personalFeelingId === personalFeelingId,
      );
      if (feeling) feeling.replyCount = Math.max((feeling.replyCount ?? 0) - 1, 0);

      return noContent(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}',
      );
    }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}/like',
  ).map((path) =>
    http.post(path, ({ params }) => {
      const personalFeelingReplyId = toNumber(params.personalFeelingReplyId);
      const reply = mockDb.personalArtworkFeelingReplies.find(
        (item: any) => item.personalFeelingReplyId === personalFeelingReplyId,
      );
      toggleLike(reply);

      return success(
        '/api/v1/personal-artworks/{personalArtworkId}/feelings/{personalFeelingId}/reply/{personalFeelingReplyId}/like',
        {
          personalFeelingReplyId,
          isLiked: Boolean(reply?.isLiked),
          likeCount: reply?.likeCount,
        },
      );
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions').map((path) =>
    http.get(path, ({ params }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);

      return success('/api/v1/personal-artworks/{personalArtworkId}/questions', {
        questions: mockDb.personalArtworkQuestions.filter(
          (question: any) => question.personalArtworkId === personalArtworkId,
        ),
      });
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions').map((path) =>
    http.post(path, async ({ params, request }) => {
      const personalArtworkId = toNumber(params.personalArtworkId);
      const question = {
        personalQuestionId: Date.now(),
        personalArtworkId,
        userId: mockDb.me.userId,
        nickname: mockDb.me.nickname,
        profileImageUrl: mockDb.me.profileImageUrl,
        ...(await readJson(request)),
        answerStatus: 'WAITING',
        isLiked: false,
        likeCount: 0,
        createdAt: now(),
      };
      mockDb.personalArtworkQuestions.unshift(question);

      return created('/api/v1/personal-artworks/{personalArtworkId}/questions', question);
    }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}').map(
    (path) =>
      http.delete(path, ({ params }) => {
        const personalQuestionId = toNumber(params.personalQuestionId);
        mockDb.personalArtworkQuestions = mockDb.personalArtworkQuestions.filter(
          (question: any) => question.personalQuestionId !== personalQuestionId,
        );
        mockDb.personalArtworkQuestionReplies = mockDb.personalArtworkQuestionReplies.filter(
          (reply: any) => reply.personalQuestionId !== personalQuestionId,
        );

        return noContent(
          '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}',
        );
      }),
  ),
  ...paths('/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/like').map(
    (path) =>
      http.post(path, ({ params }) => {
        const personalQuestionId = toNumber(params.personalQuestionId);
        const question = mockDb.personalArtworkQuestions.find(
          (item: any) => item.personalQuestionId === personalQuestionId,
        );
        toggleLike(question);

        return success(
          '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/like',
          {
            personalQuestionId,
            isLiked: Boolean(question?.isLiked),
            likeCount: question?.likeCount,
          },
        );
      }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
  ).map((path) =>
    http.get(path, ({ params }) => {
      const personalQuestionId = toNumber(params.personalQuestionId);
      const reply =
        mockDb.personalArtworkQuestionReplies.find(
          (item: any) => item.personalQuestionId === personalQuestionId,
        ) ?? null;

      return success(
        '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
        reply,
      );
    }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
  ).map((path) =>
    http.post(path, async ({ params, request }) => {
      const personalQuestionId = toNumber(params.personalQuestionId);
      const reply = {
        personalQuestionReplyId: Date.now(),
        personalQuestionId,
        userId: mockDb.me.userId,
        nickname: mockDb.me.nickname,
        isCreator: true,
        ...(await readJson(request)),
        createdAt: now(),
      };
      mockDb.personalArtworkQuestionReplies.push(reply);
      const question = mockDb.personalArtworkQuestions.find(
        (item: any) => item.personalQuestionId === personalQuestionId,
      );
      if (question) question.answerStatus = 'ANSWERED';

      return created(
        '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply',
        reply,
      );
    }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply/{personalQuestionReplyId}',
  ).map((path) =>
    http.delete(path, ({ params }) => {
      const personalQuestionId = toNumber(params.personalQuestionId);
      const personalQuestionReplyId = toNumber(params.personalQuestionReplyId);
      mockDb.personalArtworkQuestionReplies = mockDb.personalArtworkQuestionReplies.filter(
        (reply: any) => reply.personalQuestionReplyId !== personalQuestionReplyId,
      );
      const question = mockDb.personalArtworkQuestions.find(
        (item: any) => item.personalQuestionId === personalQuestionId,
      );
      if (question) question.answerStatus = 'WAITING';

      return noContent(
        '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply/{personalQuestionReplyId}',
      );
    }),
  ),
  ...paths(
    '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply/{personalQuestionReplyId}/like',
  ).map((path) =>
    http.post(path, ({ params }) => {
      const personalQuestionReplyId = toNumber(params.personalQuestionReplyId);
      const reply = mockDb.personalArtworkQuestionReplies.find(
        (item: any) => item.personalQuestionReplyId === personalQuestionReplyId,
      );
      toggleLike(reply);

      return success(
        '/api/v1/personal-artworks/{personalArtworkId}/questions/{personalQuestionId}/reply/{personalQuestionReplyId}/like',
        {
          personalQuestionReplyId,
          isLiked: Boolean(reply?.isLiked),
          likeCount: reply?.likeCount,
        },
      );
    }),
  ),
];
