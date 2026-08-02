/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { listResponse, mockDb, okStatus } from '@/mocks/data/repository';
import { created, paths, readJson, success, toNumber } from '@/mocks/response';

const now = () => new Date().toISOString();

const listDisplays = () =>
  mockDb.displays.map((display: any) => ({
    ...display,
    posterImageUrl:
      display.posterImageUrl ??
      display.posterImages?.[0]?.imageUrl ??
      display.images?.[0]?.imageUrl,
  }));

const findDisplay = (displayId: number) =>
  mockDb.displays.find((display: any) => display.displayId === displayId) ?? mockDb.displays[0];

const myDisplayItem = (display: any) => ({
  displayId: display.displayId,
  title: display.title,
  isDisplaying: display.status === 'ONGOING',
  startDate: display.startDate ?? display.startedAt,
  endDate: display.endDate ?? display.endedAt,
  school: display.organization,
  department: display.department,
  placeName: display.placeName,
  postImageUrl: display.posterImageUrl ?? display.posterImages?.[0]?.imageUrl ?? '',
});

const displayInvitationItem = (displayId: number, invitationId = displayId) => {
  const display = findDisplay(displayId);

  return {
    invitationId,
    displayId,
    inviterUserId: 1,
    inviteeUserId: mockDb.me.userId,
    status: 'PENDING',
    createdAt: now(),
    displayTitle: display.title,
    school: display.organization,
    department: display.department,
    startDate: display.startDate ?? display.startedAt,
    endDate: display.endDate ?? display.endedAt,
    placeName: display.placeName,
    posterImageUrl: display.posterImageUrl ?? display.posterImages?.[0]?.imageUrl ?? '',
    inviterNickname: '고상준(sangjun24)',
  };
};

const mockDisplayInvitations = [displayInvitationItem(101, 1), displayInvitationItem(102, 2)];

const DISPLAY_MAP_COORDINATES: Record<number, { latitude: number; longitude: number }> = {
  101: { latitude: 37.55038, longitude: 126.92577 },
  102: { latitude: 37.6541, longitude: 127.0568 },
  103: { latitude: 37.4599, longitude: 126.9519 },
  104: { latitude: 37.562, longitude: 126.9468 },
  105: { latitude: 37.5662, longitude: 126.9977 },
  106: { latitude: 37.61029, longitude: 126.99594 },
};

const isInsideBounds = (
  latitude: number,
  longitude: number,
  bounds: {
    southLatitude: number;
    westLongitude: number;
    northLatitude: number;
    eastLongitude: number;
  },
) =>
  latitude >= bounds.southLatitude &&
  latitude <= bounds.northLatitude &&
  longitude >= bounds.westLongitude &&
  longitude <= bounds.eastLongitude;

const duPicks = () => [
  {
    duPickId: 1,
    title: '디유대학교 포스터전: 작업 큐레이션',
    subtitle: '학생들의 감각이 포스터가 되는 순간',
    bannerImageUrl:
      'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a0c512ba-c1ce-43e0-ae2a-f52e2cb8dd84-KakaoTalk_Photo_2026-08-01-13-40-36.jpeg',
    createdAt: now(),
  },
  {
    duPickId: 2,
    title: '작품은 어디까지 설명해야 할까',
    subtitle: '캡션과 작가 노트에서 발견한 좋은 문장의 조건',
    bannerImageUrl:
      'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d091230b-1a5f-419c-ad7d-8c3629580e44-KakaoTalk_Photo_2026-08-02-16-33-34.jpeg',
    createdAt: now(),
  },
];

export const displayHandlers = [
  ...paths('/api/v1/display').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const displayId = Math.max(...mockDb.displays.map((display: any) => display.displayId)) + 1;
      const display = {
        ...findDisplay(101),
        ...body,
        displayId,
        title: String(body.title ?? '새 전시'),
        invitationToken: `mock-invitation-${displayId}`,
      };

      mockDb.displays.unshift(display);

      return created('/api/v1/display', { displayId, ...display });
    }),
  ),
  ...paths('/api/v1/display').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number } & Record<string, unknown>>(request);
      const display = findDisplay(Number(body.displayId ?? 101));
      Object.assign(display, body);

      return success('/api/v1/display', display);
    }),
  ),
  ...paths('/api/v1/display/closing-soon').map((path) =>
    http.get(path, () =>
      success('/api/v1/display/closing-soon', {
        exhibitions: listDisplays(),
        pagination: { nextCursor: null, size: mockDb.displays.length, hasNext: false },
      }),
    ),
  ),
  ...paths('/api/v1/display/du-picks').map((path) =>
    http.get(path, () => {
      const items = duPicks();

      return success('/api/v1/display/du-picks', {
        duPicks: items,
        pagination: { nextCursor: null, size: items.length, hasNext: false },
      });
    }),
  ),
  ...paths('/api/v1/display/graduation').map((path) =>
    http.get(path, () => success('/api/v1/display/graduation', { exhibitions: listDisplays() })),
  ),
  ...paths('/api/v1/display/invitation/{token}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/display/invitation/{token}', {
        invitationId: 1,
        token: params.token,
        displayId: 101,
        status: 'ACTIVE',
      }),
    ),
  ),
  ...paths('/api/v1/display/like').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number }>(request);

      return success('/api/v1/display/like', okStatus(Number(body.displayId ?? 101), true));
    }),
  ),
  ...paths('/api/v1/display/like').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number }>(request);

      return success('/api/v1/display/like', okStatus(Number(body.displayId ?? 101), false));
    }),
  ),
  ...paths('/api/v1/display/map').map((path) =>
    http.get(path, ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const bounds = {
        southLatitude: Number(searchParams.get('southLatitude')),
        westLongitude: Number(searchParams.get('westLongitude')),
        northLatitude: Number(searchParams.get('northLatitude')),
        eastLongitude: Number(searchParams.get('eastLongitude')),
      };
      const searchWord = searchParams.get('searchWord')?.trim();
      const cursor = Number(searchParams.get('cursor') ?? 0);
      const size = Number(searchParams.get('size') ?? mockDb.displays.length);
      const hasBounds = Object.values(bounds).every(Number.isFinite);
      const start = Number.isFinite(cursor) ? cursor : 0;

      const filteredMarkers = listDisplays()
        .map((display: any) => {
          const coordinates = DISPLAY_MAP_COORDINATES[display.displayId];

          if (!coordinates) {
            return null;
          }

          return {
            displayId: display.displayId,
            title: display.title,
            startDate: display.period?.startDate ?? display.startedAt,
            endDate: display.period?.endDate ?? display.endedAt,
            locationName: display.location?.placeName ?? display.placeName,
            posterImageUrl: display.posterImageUrl,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          };
        })
        .filter((marker: any) => marker)
        .filter(
          (marker: any) => !hasBounds || isInsideBounds(marker.latitude, marker.longitude, bounds),
        )
        .filter((marker: any) => !searchWord || marker.title.includes(searchWord));
      const markers = filteredMarkers.slice(start, start + size);
      const nextCursor = start + size < filteredMarkers.length ? start + size : null;

      return success('/api/v1/display/map', {
        markers,
        pagination: {
          nextCursor,
          size: markers.length,
          hasNext: nextCursor !== null,
        },
      });
    }),
  ),
  ...paths('/api/v1/display/me').map((path) =>
    http.get(path, () =>
      success('/api/v1/display/me', {
        createdDisplays: listDisplays().slice(0, 3).map(myDisplayItem),
        participatedDisplays: listDisplays().slice(3, 6).map(myDisplayItem),
      }),
    ),
  ),
  ...paths('/api/v1/display/me/nickname').map((path) =>
    http.patch(path, async ({ request }) =>
      success('/api/v1/display/me/nickname', await readJson(request)),
    ),
  ),
  ...paths('/api/v1/display/search').map((path) =>
    http.get(path, ({ request }) => {
      const keyword = new URL(request.url).searchParams.get('searchWord') ?? '';
      const exhibitions = listDisplays().filter(
        (display: any) => !keyword || display.title.includes(keyword),
      );

      return success('/api/v1/display/search', {
        exhibitions,
        pagination: { nextCursor: null, size: exhibitions.length, hasNext: false },
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/display/{displayId}', findDisplay(toNumber(params.displayId, 101))),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/invitation').map((path) =>
    http.post(path, ({ params }) =>
      created('/api/v1/display/{displayId}/invitation', {
        invitationId: 1,
        displayId: toNumber(params.displayId, 101),
        token: `mock-invitation-${params.displayId}`,
        status: 'ACTIVE',
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/invitation/disable').map((path) =>
    http.patch(path, ({ params }) =>
      success('/api/v1/display/{displayId}/invitation/disable', {
        displayId: toNumber(params.displayId, 101),
        invitationDisabledAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/display-invitations/displays/{displayId}').map((path) =>
    http.post(path, ({ params }) =>
      created('/api/v1/display-invitations/displays/{displayId}', {
        invitationId: 1,
        displayId: toNumber(params.displayId, 101),
        status: 'PENDING',
      }),
    ),
  ),
  ...paths('/api/v1/display-invitations/me').map((path) =>
    http.get(path, () =>
      success('/api/v1/display-invitations/me', {
        invitations: mockDisplayInvitations.filter((invitation) => invitation.status === 'PENDING'),
      }),
    ),
  ),
  ...paths('/api/v1/display-invitations/{invitationId}/accept').map((path) =>
    http.post(path, ({ params }) => {
      const invitationId = toNumber(params.invitationId, 1);
      const invitation = mockDisplayInvitations.find((item) => item.invitationId === invitationId);

      if (invitation) {
        invitation.status = 'ACCEPTED';
      }

      return success('/api/v1/display-invitations/{invitationId}/accept', {
        ...(invitation ?? { invitationId }),
        status: 'ACCEPTED',
      });
    }),
  ),
  ...paths('/api/v1/display-invitations/{invitationId}/reject').map((path) =>
    http.post(path, ({ params }) => {
      const invitationId = toNumber(params.invitationId, 1);
      const invitation = mockDisplayInvitations.find((item) => item.invitationId === invitationId);

      if (invitation) {
        invitation.status = 'REJECTED';
      }

      return success('/api/v1/display-invitations/{invitationId}/reject', {
        ...(invitation ?? { invitationId }),
        status: 'REJECTED',
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/members').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/display/{displayId}/members', {
        members: findDisplay(toNumber(params.displayId, 101)).teamMembers ?? [],
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/reviews').map((path) =>
    http.get(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const reviews = mockDb.displayReviews.filter((review: any) => review.displayId === displayId);

      return success('/api/v1/display/{displayId}/reviews', {
        reviews,
        nextCursorId: null,
        size: reviews.length,
        hasNext: false,
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/reviews').map((path) =>
    http.post(path, async ({ params, request }) => {
      const body = await readJson<{ content?: string; images?: unknown[] }>(request);
      const review = {
        displayReviewId: mockDb.displayReviews.length + 1,
        reviewId: mockDb.displayReviews.length + 1,
        displayId: toNumber(params.displayId, 101),
        content: body.content ?? '',
        images: body.images ?? [],
        writer: mockDb.me,
        user: mockDb.me,
        likeCount: 0,
        replyCount: 0,
        createdAt: now(),
        updatedAt: now(),
      };
      mockDb.displayReviews.unshift(review);

      return created('/api/v1/display/{displayId}/reviews', review);
    }),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}').map((path) =>
    http.delete(path, ({ params }) =>
      success('/api/v1/display/{displayId}/reviews/{displayReviewId}', {
        displayReviewId: toNumber(params.displayReviewId),
        deletedAt: now(),
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/like').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/display/{displayId}/reviews/{displayReviewId}/like', {
        displayReviewId: toNumber(params.displayReviewId),
        isLiked: true,
        likeCount: 1,
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies').map((path) =>
    http.get(path, () =>
      success('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies', {
        replies: [],
        nextCursorId: null,
        size: 0,
        hasNext: false,
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ content?: string }>(request);

      return created('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies', {
        displayReviewReplyId: 1,
        content: body.content ?? '',
        createdAt: now(),
      });
    }),
  ),
  ...paths(
    '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}',
  ).map((path) =>
    http.delete(path, ({ params }) =>
      success(
        '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}',
        {
          displayReviewReplyId: toNumber(params.displayReviewReplyId),
          deletedAt: now(),
        },
      ),
    ),
  ),
  ...paths(
    '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}/like',
  ).map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}/like',
        {
          displayReviewReplyId: toNumber(params.displayReviewReplyId),
          isLiked: true,
          likeCount: 1,
        },
      ),
    ),
  ),
];
