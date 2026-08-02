/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { created, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();
const findArtwork = (artworkId: number) =>
  mockDb.artworks.find((artwork: any) => artwork.artworkId === artworkId) ?? mockDb.artworks[0];

// 가짜 API 응답 데이터: 백엔드에 내 작품 질문 조회 API가 생기기 전까지 답변할 질문 화면에서 사용합니다.
const myArtworkQuestions = [
  {
    questionId: 1,
    artworkId: 1001,
    artworkName: '빛의 결',
    content:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    answerStatus: 'PENDING',
    isPublic: false,
    createdAt: now(),
    user: {
      userId: 11,
      nickname: 'artseeker_j',
    },
  },
  {
    questionId: 2,
    artworkId: 1001,
    artworkName: '빛의 결',
    content:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    answerStatus: 'PENDING',
    isPublic: true,
    createdAt: now(),
    user: {
      userId: 12,
      nickname: 'artseeker_j',
    },
  },
  {
    questionId: 3,
    artworkId: 1002,
    artworkName: '형태의 침묵',
    content: '작품 설명에서 말한 반복되는 선의 의미가 궁금합니다.',
    answerStatus: 'ANSWERED',
    isPublic: true,
    createdAt: now(),
    user: {
      userId: 13,
      nickname: 'viewer_08',
    },
  },
];

export const artworkHandlers = [
  ...paths('/api/v1/artworks').map((path) =>
    http.get(path, ({ request }) => {
      const displayId = Number(new URL(request.url).searchParams.get('displayId'));
      const artworks = Number.isFinite(displayId)
        ? mockDb.artworks.filter((artwork: any) => artwork.displayId === displayId)
        : mockDb.artworks;

      return success('/api/v1/artworks', listResponse(artworks));
    }),
  ),
  ...paths('/api/v1/artworks').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const artwork = {
        ...findArtwork(1001),
        ...body,
        artworkId: Math.max(...mockDb.artworks.map((item: any) => item.artworkId)) + 1,
        artworkName: String(body.artworkName ?? body.title ?? '새 작품'),
      };
      mockDb.artworks.unshift(artwork);

      return created('/api/v1/artworks', artwork);
    }),
  ),
  ...paths('/api/v1/artworks/order').map((path) =>
    http.put(path, async ({ request }) => {
      const body = await readJson<{ orderedArtworkIds?: number[] }>(request);

      return success('/api/v1/artworks/order', {
        displayId: mockDb.artworks[0]?.displayId ?? 101,
        updatedCount: body.orderedArtworkIds?.length ?? 0,
      });
    }),
  ),
  ...paths('/api/v1/artworks/preview').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? mockDb.artworks.length);
      const start = page * size;
      const artworks = mockDb.artworks.slice(start, start + size);

      return success('/api/v1/artworks/preview', {
        artworks,
        page,
        size: artworks.length,
        isLast: start + size >= mockDb.artworks.length,
      });
    }),
  ),
  // 가짜 API: 백엔드에 내 작품 전체 조회 API가 생기기 전까지 마이페이지 작가 뷰에서만 사용합니다.
  ...paths('/api/v1/artworks/me').map((path) =>
    http.get(path, () =>
      success('/api/v1/artworks/me', {
        artworks: mockDb.artworks.map((artwork: any) => ({
          artworkId: artwork.artworkId,
          artworkName: artwork.artworkName ?? artwork.title,
          artistName: artwork.artistName ?? artwork.artist,
          artworkImageUrl: artwork.artworkImageUrl ?? artwork.images?.[0]?.imageUrl ?? '',
          displayId: artwork.displayId,
          displayTitle:
            mockDb.displays.find((display: any) => display.displayId === artwork.displayId)
              ?.title ?? '',
        })),
      }),
    ),
  ),
  // 가짜 API: 백엔드에 내 작품 질문 조회 API가 생기기 전까지 답변할 질문 화면에서 사용합니다.
  ...paths('/api/v1/artworks/question/me').map((path) =>
    http.get(path, () =>
      success('/api/v1/artworks/question/me', {
        questions: myArtworkQuestions,
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}', findArtwork(toNumber(params.artworkId, 1001))),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}', {
        deletedArtworkId: toNumber(params.artworkId),
        message: '삭제되었습니다.',
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/like').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/like', okStatus(toNumber(params.artworkId), true)),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/like').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/like', okStatus(toNumber(params.artworkId), false)),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/feelings', {
        feelings: mockDb.artworkFeelings.filter(
          (feeling: any) => feeling.artworkId === toNumber(params.artworkId, 1001),
        ),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings').map((path) =>
    http.post(path, async ({ params, request }) => {
      const body = await readJson<{ content?: string }>(request);
      const feeling = {
        feelingId: Date.now(),
        artworkId: toNumber(params.artworkId, 1001),
        content: body.content ?? '',
        createdAt: now(),
      };
      mockDb.artworkFeelings.unshift({
        ...feeling,
        writer: mockDb.me,
        user: mockDb.me,
        likeCount: 0,
        liked: false,
      });

      return created('/api/v1/artworks/{artworkId}/feelings', feeling);
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}').map((path) =>
    http.patch(path, async ({ params, request }) =>
      success('/api/v1/artworks/{artworkId}/feelings/{feelingId}', {
        feelingId: toNumber(params.feelingId),
        ...(await readJson(request)),
        updatedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}').map((path) =>
    http.delete(path, () => noContent('/api/v1/artworks/{artworkId}/feelings/{feelingId}')),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/like').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/like', {
        artLikeId: Date.now(),
        feelingId: toNumber(params.feelingId),
        userId: 1,
        createdAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/replies').map((path) =>
    http.get(path, () =>
      success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/replies', {
        replies: [],
        nextCursorId: null,
        size: 0,
        hasNext: false,
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply').map((path) =>
    http.post(path, async ({ request }) =>
      created('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply', {
        feelingReplyId: Date.now(),
        ...(await readJson(request)),
        createdAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}', {
        feelingReplyId: toNumber(params.feelingReplyId),
        deletedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}/like').map(
    (path) =>
      http.post(path, ({ params }) =>
        success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}/like', {
          feelingReplyId: toNumber(params.feelingReplyId),
          isLiked: true,
          likeCount: 1,
        }),
      ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/questions').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/questions', {
        questions: mockDb.artworkQuestions.filter(
          (question: any) => question.artworkId === toNumber(params.artworkId, 1001),
        ),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/questions').map((path) =>
    http.post(path, async ({ params, request }) =>
      created('/api/v1/artworks/{artworkId}/questions', {
        artQueId: Date.now(),
        questionId: Date.now(),
        artworkId: toNumber(params.artworkId, 1001),
        ...(await readJson(request)),
        answerStatus: 'WAITING',
        createdAt: now(),
        updatedAt: now(),
        deletedAt: null,
        userId: 1,
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/questions/{questionId}').map((path) =>
    http.patch(path, async ({ params, request }) =>
      success('/api/v1/artworks/{artworkId}/questions/{questionId}', {
        artQueId: toNumber(params.questionId),
        questionId: toNumber(params.questionId),
        ...(await readJson(request)),
        updatedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/questions/{questionId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}/questions/{questionId}', {
        artQueId: toNumber(params.questionId),
        deletedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/artworks/{artworkId}/questions/{questionId}/reply').map((path) =>
    http.post(path, async ({ request }) =>
      created('/api/v1/artworks/{artworkId}/questions/{questionId}/reply', {
        queReplyId: Date.now(),
        ...(await readJson(request)),
        createdAt: now(),
        updatedAt: now(),
        deletedAt: null,
        createrId: 1,
      }),
    ),
  ),
];
