/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { listResponse, mockDb, okStatus, toArtistList } from '@/mocks/data/repository';
import { created, fail, noContent, paths, readJson, success, toNumber } from '@/mocks/response';
import { hasMockScenario } from '@/mocks/scenario';
import { matchesSearchWord } from '@/mocks/searchText';

const now = () => new Date().toISOString();

/* 대표 이미지(isThumbnail, 없으면 첫 장)를 목록 카드 필드로 바꿉니다. 영상이면 썸네일을 보이고 영상 주소를 따로 둡니다 */
const toArtworkCard = (images: any[] | undefined, fallbackUrl = '') => {
  const artworkImages = (images ?? []).filter((image) => image.imageType !== 'WORK_PROCESS');
  const main = artworkImages.find((image) => image.isThumbnail) ?? artworkImages[0];
  if (!main) return { artworkImageUrl: fallbackUrl, artworkVideoUrl: null };

  return main.mediaType === 'VIDEO'
    ? { artworkImageUrl: main.thumbnailUrl ?? '', artworkVideoUrl: main.imageUrl }
    : { artworkImageUrl: main.imageUrl, artworkVideoUrl: null };
};
const findArtwork = (artworkId: number) =>
  mockDb.artworks.find((artwork: any) => artwork.artworkId === artworkId) ?? mockDb.artworks[0];

/* 요청의 coAuthors({ userIds, rawNames })를 응답 형식([{ userId, name }])으로 바꿉니다. */
const toCoAuthorList = (
  coAuthors: { userIds?: number[]; rawNames?: string[] } | undefined,
  displayId: number,
) => {
  const teamMembers =
    mockDb.displays.find((display: any) => display.displayId === displayId)?.teamMembers ?? [];

  return [
    ...(coAuthors?.userIds ?? []).map((userId) => ({
      userId,
      name:
        teamMembers.find((member: any) => member.userId === userId)?.displayNickname ??
        `팀원 ${userId}`,
    })),
    ...(coAuthors?.rawNames ?? []).map((name) => ({ userId: null, name })),
  ];
};

const SELECTABLE_ARTWORK_TYPES = new Set([
  'PAINTING',
  'SCULPTURE',
  'PHOTOGRAPHY',
  'GRAPHIC',
  'BRANDING',
  'PRODUCT',
  'VIDEO',
  'SPACE',
  'ARCHITECTURE',
  'UX_UI',
  'CRAFTS',
  'OTHERS',
]);
const CANONICAL_ARTWORK_TYPES: Record<string, string> = {
  UXUI: 'UX_UI',
  MEDIA: 'VIDEO',
  CRAFT: 'CRAFTS',
  ETC: 'OTHERS',
};
const MAX_ARTWORK_TYPES = 3;

/*
 * 서버처럼 분야를 1~3개(별칭은 표준 값으로 합쳐 센다)로 받고,
 * 예전 값(DESIGN · FASHION 등)은 이미 저장된 분야를 다시 보낼 때만 받는다. 맞지 않으면 null
 */
const resolveArtworkTypes = (body: Record<string, any>, previous: readonly string[] = []) => {
  const requested: string[] = body.types?.length ? body.types : body.type ? [body.type] : [];
  const types = [...new Set(requested.map((type) => CANONICAL_ARTWORK_TYPES[type] ?? type))];
  const kept = new Set(previous.map((type) => CANONICAL_ARTWORK_TYPES[type] ?? type));
  const isAllowed = (type: string) => SELECTABLE_ARTWORK_TYPES.has(type) || kept.has(type);

  return types.length > 0 && types.length <= MAX_ARTWORK_TYPES && types.every(isAllowed)
    ? types
    : null;
};

const invalidArtworkTypes = (path: string) =>
  fail(path, 400, 'INVALID_ARTWORK_FIELD', '작품 분야는 신규 분야 중 1~3개만 선택할 수 있습니다.');

/* 생략 · null · 공백이면 재료를 비운다 */
const toMaterialMedia = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

/* 대표 · 공동 작가 중 계정이 있는 사람의 id(중복 없이) */
const toArtistUserIds = (artwork: any): number[] => [
  ...new Set(
    [
      artwork.artistUserId,
      ...(artwork.coAuthors ?? []).map((coAuthor: any) => coAuthor.userId),
    ].filter((userId): userId is number => typeof userId === 'number'),
  ),
];

export const artworkHandlers = [
  ...paths('/api/v1/artworks').map((path) =>
    http.get(path, ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const displayIdParam = searchParams.get('displayId');
      const userIdParam = searchParams.get('userId');

      // 실서버처럼 작품 공개 시점 전이어도 작품을 그대로 준다(숨김은 전시 상세의 artworkContentVisible 로 판단)
      const artworks = displayIdParam
        ? hasMockScenario('display-no-works')
          ? []
          : mockDb.artworks.filter((artwork: any) => artwork.displayId === Number(displayIdParam))
        : userIdParam
          ? mockDb.artworks.filter((artwork: any) => artwork.artistUserId === Number(userIdParam))
          : mockDb.artworks;

      return success(
        '/api/v1/artworks',
        listResponse(
          artworks.map((artwork: any) => ({
            ...artwork,
            artistUserIds: toArtistUserIds(artwork),
            artists: toArtistList(artwork),
            artworkCrop: artwork.artworkCrop ?? null,
          })),
        ),
      );
    }),
  ),
  ...paths('/api/v1/artworks').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, any>>(request);
      const types = resolveArtworkTypes(body);
      if (!types) return invalidArtworkTypes('/api/v1/artworks');
      // 요청 데이터로만 구성합니다. 기존 작품을 템플릿으로 복사하면
      // 이미지 등 덮어쓰지 않은 필드가 그대로 남아 다른 작품 정보가 노출됩니다.
      const { artworkImageUrl: imageUrl, artworkVideoUrl } = toArtworkCard(body.images);
      const artistName = body.artistName ?? mockDb.me.nickname;
      const artworkName = String(body.artworkName ?? body.title ?? '새 작품');
      const artwork = {
        ...body,
        artworkId: Math.max(...mockDb.artworks.map((item: any) => item.artworkId)) + 1,
        displayId: Number(body.displayId ?? 101),
        artworkName,
        title: artworkName,
        artistName,
        artist: artistName,
        content: body.content ?? '',
        description: body.content ?? '',
        type: types[0],
        types,
        productionYear: body.productionYear ?? new Date().getFullYear(),
        materialMedia: toMaterialMedia(body.materialMedia),
        material: toMaterialMedia(body.materialMedia),
        size: body.size ?? '',
        point: body.point ?? '',
        images: body.images ?? [],
        coAuthors: toCoAuthorList(body.coAuthors, Number(body.displayId ?? 101)),
        artworkCrop: body.artworkCrop ?? null,
        artworkImageUrl: imageUrl,
        artworkVideoUrl,
        thumbnailUrl: imageUrl,
        imageUrl,
        order: mockDb.artworks.length + 1,
      };
      mockDb.artworks.unshift(artwork);

      return created('/api/v1/artworks', artwork);
    }),
  ),
  ...paths('/api/v1/artworks/order').map((path) =>
    http.put(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number; orderedArtworkIds?: number[] }>(request);
      const orderedIds = body.orderedArtworkIds ?? [];

      // 요청 순서대로 해당 전시의 작품을 재배치합니다.
      if (orderedIds.length > 0) {
        const byId = new Map<number, any>(
          mockDb.artworks.map((artwork: any) => [artwork.artworkId, artwork]),
        );
        const reordered = orderedIds
          .map((artworkId) => byId.get(artworkId))
          .filter((artwork): artwork is any => Boolean(artwork));
        const rest = mockDb.artworks.filter(
          (artwork: any) => !orderedIds.includes(artwork.artworkId),
        );

        mockDb.artworks = [...reordered, ...rest].map((artwork: any, index: number) => ({
          ...artwork,
          order: index + 1,
        }));
      }

      return success('/api/v1/artworks/order', {
        displayId: body.displayId ?? mockDb.artworks[0]?.displayId ?? 101,
        updatedCount: orderedIds.length,
      });
    }),
  ),
  // 가짜 API: 탐색 작품 탭. 백엔드에 작품 검색 API가 생기기 전까지 탐색 정책대로 동작하게 둔다
  ...paths('/api/v1/artworks/search').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const searchWord = url.searchParams.get('searchWord');
      const type = url.searchParams.get('type');
      const status = url.searchParams.get('status');
      const page = Number(url.searchParams.get('page') ?? 0) || 0;
      const size = Number(url.searchParams.get('size') ?? 20);

      const matched = mockDb.artworks
        .filter((artwork: any) => {
          const display = mockDb.displays.find((item: any) => item.displayId === artwork.displayId);
          if (!display) return false;
          // 전시 유형 · 상태 필터는 작품이 속한 전시 기준이다
          if (type && display.displayType !== type) return false;
          if (status && display.status !== status) return false;
          // 작품명 · 대표 · 공동 작가명으로 찾는다
          return matchesSearchWord(searchWord, [
            artwork.artworkName,
            ...(artwork.artists ?? []).map((artist: any) => artist.name),
          ]);
        })
        .sort((a: any, b: any) => b.artworkId - a.artworkId);

      const start = page * size;
      const artworks = matched.slice(start, start + size).map((artwork: any) => ({
        artworkId: artwork.artworkId,
        artworkName: artwork.artworkName,
        artistName: artwork.artistName,
        artistUserId: artwork.artistUserId,
        artworkImageUrl: artwork.artworkImageUrl,
        imageWidth: artwork.imageWidth,
        imageHeight: artwork.imageHeight,
        exhibitionInfo: artwork.exhibitionInfo,
        artists: artwork.artists ?? [{ userId: null, name: artwork.artistName ?? '' }],
        artworkCrop: artwork.artworkCrop ?? null,
      }));

      return success('/api/v1/artworks/search', {
        artworks,
        page,
        size,
        isLast: start + size >= matched.length,
      });
    }),
  ),
  ...paths('/api/v1/artworks/preview').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? mockDb.artworks.length);
      const fieldParam = url.searchParams.get('field');
      const fields = fieldParam ? fieldParam.split(',').filter(Boolean) : [];

      const filteredArtworks =
        fields.length > 0
          ? mockDb.artworks.filter(
              (artwork: any) => fields.includes(artwork.type) || fields.includes(artwork.field),
            )
          : mockDb.artworks;

      const start = page * size;
      const artworks = filteredArtworks.slice(start, start + size);

      return success('/api/v1/artworks/preview', {
        artworks,
        page,
        size: artworks.length,
        isLast: start + size >= filteredArtworks.length,
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
  ...paths('/api/v1/artworks/{artworkId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/artworks/{artworkId}', findArtwork(toNumber(params.artworkId, 1001))),
    ),
  ),
  // 수정 화면 조회: 관람용 상세와 달리 공동 작가 · Q&A 담당자 · 분야 목록(types)을 함께 내려준다
  ...paths('/api/v1/artworks/{artworkId}/edit').map((path) =>
    http.get(path, ({ params }) => {
      const artwork = findArtwork(toNumber(params.artworkId, 1001));

      return success('/api/v1/artworks/{artworkId}/edit', {
        artworkId: artwork.artworkId,
        displayId: artwork.displayId,
        artworkName: artwork.artworkName ?? artwork.title,
        content: artwork.content ?? '',
        type: artwork.type,
        types: artwork.types ?? (artwork.type ? [artwork.type] : []),
        productionYear: artwork.productionYear,
        materialMedia: artwork.materialMedia ?? artwork.material ?? null,
        size: artwork.size ?? '',
        point: artwork.point ?? '',
        images: artwork.images ?? [],
        artistName: artwork.artistName ?? artwork.artist,
        artistUserId: artwork.artistUserId ?? null,
        artworkCrop: artwork.artworkCrop ?? null,
        coAuthors: Array.isArray(artwork.coAuthors) ? artwork.coAuthors : [],
        qaHandlerUserIds:
          artwork.qaHandlerUserIds ?? (artwork.artistUserId ? [artwork.artistUserId] : []),
      });
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      // 없는 작품을 고치면 다른 작품이 바뀌지 않게, id 가 정확히 같은 작품만 고친다
      const artwork = mockDb.artworks.find(
        (item: any) => item.artworkId === toNumber(params.artworkId),
      );
      if (!artwork) {
        return fail(
          '/api/v1/artworks/{artworkId}',
          404,
          'ARTWORK_NOT_FOUND',
          '작품을 찾을 수 없습니다.',
        );
      }
      const body = await readJson<Record<string, any>>(request);
      const types = resolveArtworkTypes(
        body,
        artwork.types ?? (artwork.type ? [artwork.type] : []),
      );
      if (!types) return invalidArtworkTypes('/api/v1/artworks/{artworkId}');
      const { artworkImageUrl: imageUrl, artworkVideoUrl } = toArtworkCard(
        body.images,
        artwork.artworkImageUrl,
      );
      const coAuthors = toCoAuthorList(body.coAuthors, artwork.displayId);
      const materialMedia = toMaterialMedia(body.materialMedia);
      // 영역을 생략하면 대표 사진이 같은 동안 유지하고, 대표 사진이 바뀌면 지운다
      const artworkCrop =
        body.artworkCrop ?? (imageUrl === artwork.artworkImageUrl ? artwork.artworkCrop : null);

      Object.assign(artwork, body, {
        title: body.artworkName ?? artwork.title,
        type: types[0],
        types,
        materialMedia,
        material: materialMedia,
        artworkCrop: artworkCrop ?? null,
        artworkImageUrl: imageUrl,
        artworkVideoUrl,
        thumbnailUrl: imageUrl,
        imageUrl,
        coAuthors,
      });

      return success('/api/v1/artworks/{artworkId}', {
        ...artwork,
        coAuthorCount: coAuthors.length,
      });
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}').map((path) =>
    http.delete(path, ({ params }) => {
      const artworkId = toNumber(params.artworkId);
      mockDb.artworks = mockDb.artworks.filter((artwork: any) => artwork.artworkId !== artworkId);

      return success('/api/v1/artworks/{artworkId}', {
        deletedArtworkId: artworkId,
        message: '삭제되었습니다.',
      });
    }),
  ),
  /* 스웨거: POST는 좋아요 추가, DELETE는 취소입니다. */
  ...paths('/api/v1/artworks/{artworkId}/like').map((path) =>
    http.post(path, ({ params }) => {
      const artwork = findArtwork(toNumber(params.artworkId, 1001));

      if (artwork && !artwork.isLiked) {
        artwork.isLiked = true;
        artwork.likeCount = (artwork.likeCount ?? 0) + 1;
      }

      return success('/api/v1/artworks/{artworkId}/like', {
        ...okStatus(toNumber(params.artworkId), true),
        likeCount: artwork?.likeCount ?? 0,
      });
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}/like').map((path) =>
    http.delete(path, ({ params }) => {
      const artwork = findArtwork(toNumber(params.artworkId, 1001));

      if (artwork?.isLiked) {
        artwork.isLiked = false;
        artwork.likeCount = Math.max(0, (artwork.likeCount ?? 0) - 1);
      }

      return success('/api/v1/artworks/{artworkId}/like', {
        ...okStatus(toNumber(params.artworkId), false),
        likeCount: artwork?.likeCount ?? 0,
      });
    }),
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
      // 최신 감상이 목록 아래에 표시되도록 뒤에 붙입니다.
      mockDb.artworkFeelings.push({
        ...feeling,
        writer: mockDb.me,
        user: mockDb.me,
        likeCount: 0,
        isLiked: false,
        liked: false,
        replyCount: 0,
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
    http.delete(path, ({ params }) => {
      const feelingId = toNumber(params.feelingId);

      // 감상과 딸린 답글을 함께 제거합니다.
      mockDb.artworkFeelings = mockDb.artworkFeelings.filter(
        (item: any) => item.feelingId !== feelingId,
      );
      mockDb.artworkFeelingReplies = mockDb.artworkFeelingReplies.filter(
        (reply: any) => reply.feelingId !== feelingId,
      );

      return noContent('/api/v1/artworks/{artworkId}/feelings/{feelingId}');
    }),
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
    http.get(path, ({ params }) => {
      const feelingId = toNumber(params.feelingId);
      const replies = mockDb.artworkFeelingReplies.filter(
        (reply: any) => reply.feelingId === feelingId,
      );

      return success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/replies', {
        replies,
        nextCursorId: null,
        size: replies.length,
        hasNext: false,
      });
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply').map((path) =>
    http.post(path, async ({ params, request }) => {
      const body = await readJson<{ content?: string }>(request);
      const feelingId = toNumber(params.feelingId);
      const reply = {
        feelingReplyId: Date.now(),
        feelingId,
        content: body.content ?? '',
        userId: mockDb.me.userId,
        nickname: mockDb.me.nickname,
        isCreator: false,
        createdAt: now(),
      };

      // 최신 답글이 아래에 표시되도록 뒤에 붙입니다.
      mockDb.artworkFeelingReplies.push(reply);

      const feeling = mockDb.artworkFeelings.find((item: any) => item.feelingId === feelingId);
      if (feeling) feeling.replyCount = (feeling.replyCount ?? 0) + 1;

      return created('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply', reply);
    }),
  ),
  ...paths('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}').map((path) =>
    http.delete(path, ({ params }) => {
      const feelingReplyId = toNumber(params.feelingReplyId);
      const feelingId = toNumber(params.feelingId);

      mockDb.artworkFeelingReplies = mockDb.artworkFeelingReplies.filter(
        (reply: any) => reply.feelingReplyId !== feelingReplyId,
      );

      const feeling = mockDb.artworkFeelings.find((item: any) => item.feelingId === feelingId);
      if (feeling) feeling.replyCount = Math.max(0, (feeling.replyCount ?? 0) - 1);

      return success('/api/v1/artworks/{artworkId}/feelings/{feelingId}/reply/{feelingReplyId}', {
        feelingReplyId,
        deletedAt: now(),
      });
    }),
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
];
