/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb, okStatus } from '@/mocks/data/repository';
import { created, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

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

/*
 * 전시 상세 응답. 스웨거 DisplayDetailResponse가 항상 내려주는 필드를 보강합니다.
 * teamMembers/invitations가 없으면 화면에서 .find() 호출 시 터집니다.
 */
const displayDetailResponse = (displayId: number) => {
  const display = findDisplay(displayId);

  return {
    ...display,
    ownerUserId: display.ownerUserId ?? mockDb.me.userId,
    isLiked: display.isLiked ?? false,
    likeCount: display.likeCount ?? 0,
    invitationToken: display.invitationToken ?? null,
    invitationDisabledAt: display.invitationDisabledAt ?? null,
    teamMembers: display.teamMembers ?? [],
    invitations: display.invitations ?? [],
    contentCategories: display.contentCategories ?? [],
    images: display.images ?? display.posterImages ?? [],
  };
};

const myDisplayItem = (display: any) => ({
  displayId: display.displayId,
  title: display.title,
  displayStatus: display.status === 'ONGOING' ? 'DISPLAYING' : display.status,
  startDate: display.startDate ?? display.startedAt,
  endDate: display.endDate ?? display.endedAt,
  school: display.organization,
  department: display.department,
  placeName: display.placeName,
  postImageUrl: display.posterImageUrl ?? display.posterImages?.[0]?.imageUrl ?? '',
  displayNickname: display.displayNickname ?? display.artistName ?? '작가명',
  artistName: display.displayNickname ?? display.artistName ?? '작가명',
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
    title: display.title,
    school: display.organization,
    department: display.department,
    schoolDepartmentName: [display.organization, display.department].filter(Boolean).join(' '),
    startDate: display.startDate ?? display.startedAt,
    endDate: display.endDate ?? display.endedAt,
    location: 'SEOUL',
    placeName: display.placeName,
    thumbnailUrl: display.posterImageUrl ?? display.posterImages?.[0]?.imageUrl ?? '',
    leaderName: '고상준',
    userNickname: 'sangjun24',
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
  // PATCH /api/v1/display: 전시 수정. 스웨거 UpdateDisplayRequest 필드만 반영합니다.
  ...paths('/api/v1/display').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<Record<string, any>>(request);
      const display = findDisplay(Number(body.displayId ?? 101));

      // 값이 넘어온 필드만 덮어씁니다. (undefined로 기존 값이 지워지는 것을 방지)
      const assign = (key: string, value: unknown) => {
        if (value !== undefined) display[key] = value;
      };

      assign('title', body.title);
      assign('name', body.title);
      assign('subtitle', body.subtitle);
      assign('description', body.description);
      assign('content', body.description);
      assign('posterImageUrl', body.posterImageUrl);
      assign('thumbnailUrl', body.posterImageUrl);
      assign('displayType', body.type);
      assign('displayFields', body.fields);
      assign('organization', body.schoolOrOrganization);
      assign('department', body.departmentOrClub);
      assign('hostOrganizationName', body.hostOrganizationName);
      assign('placeName', body.placeName);
      assign('note', body.precautions);
      assign('precautions', body.precautions);

      // 전시 기간/운영 시간은 목록·상세가 서로 다른 키를 읽어 함께 갱신합니다.
      if (body.startDate !== undefined) {
        display.startDate = body.startDate;
        display.startedAt = body.startDate;
      }
      if (body.endDate !== undefined) {
        display.endDate = body.endDate;
        display.endedAt = body.endDate;
      }
      assign('startTime', body.openTime);
      assign('endTime', body.closeTime);

      return success('/api/v1/display', display);
    }),
  ),
  /* 공개 시점 조회는 전시 상세 응답에 포함되어 별도 핸들러가 없습니다. */
  ...paths('/api/v1/display/{displayId}/reservation').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const body = await readJson<{
        artworkContentOpen?: string;
        exhibitionContentOpen?: string;
      }>(request);
      const display = findDisplay(toNumber(params.displayId, 101));

      display.artworkContentOpen =
        body.artworkContentOpen ?? display.artworkContentOpen ?? 'ON_EXHIBITION';
      display.exhibitionContentOpen =
        body.exhibitionContentOpen ?? display.exhibitionContentOpen ?? 'ON_EXHIBITION';

      return success('/api/v1/display/{displayId}/reservation', display);
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
  /*
   * 스웨거: 초대 토큰으로 전시 상세를 조회합니다(PUBLIC).
   * 실서버는 만료/비활성 링크에 실패를 내려주지만, mock에서는 항상 성공을 반환합니다.
   */
  ...paths('/api/v1/display/invitation/{token}').map((path) =>
    http.get(path, () => success('/api/v1/display/invitation/{token}', displayDetailResponse(101))),
  ),
  /* 스웨거: POST는 좋아요 추가, DELETE는 좋아요 취소입니다. */
  ...paths('/api/v1/display/like').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number }>(request);
      const display = findDisplay(Number(body.displayId ?? 101));

      if (!display.isLiked) {
        display.isLiked = true;
        display.likeCount = (display.likeCount ?? 0) + 1;
      }

      return success('/api/v1/display/like', {
        ...okStatus(display.displayId, true),
        displayId: display.displayId,
        likeCount: display.likeCount,
      });
    }),
  ),
  ...paths('/api/v1/display/like').map((path) =>
    http.delete(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number }>(request);
      const display = findDisplay(Number(body.displayId ?? 101));

      if (display.isLiked) {
        display.isLiked = false;
        display.likeCount = Math.max(0, (display.likeCount ?? 0) - 1);
      }

      return success('/api/v1/display/like', {
        ...okStatus(display.displayId, false),
        displayId: display.displayId,
        likeCount: display.likeCount,
      });
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
            schoolDepartmentName: display.schoolDepartmentName,
            isArchived: display.isArchived ?? display.archived ?? false,
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
  ...paths('/api/v1/display/{displayId}/exit').map((path) =>
    http.delete(path, () => noContent('/api/v1/display/{displayId}/exit')),
  ),
  ...paths('/api/v1/display/{displayId}').map((path) =>
    http.delete(path, () => noContent('/api/v1/display/{displayId}')),
  ),
  ...paths('/api/v1/display/me/nickname').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number; displayNickname?: string }>(request);
      if (body.displayId && body.displayNickname) {
        const display = findDisplay(body.displayId);
        display.displayNickname = body.displayNickname;
        if (display.teamMembers) {
          const member = display.teamMembers.find((m: any) => m.userId === mockDb.me.userId);
          if (member) member.displayNickname = body.displayNickname;
        }
      }
      return success('/api/v1/display/me/nickname', body);
    }),
  ),
  ...paths('/api/v1/display/search').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const keyword = url.searchParams.get('searchWord') ?? '';
      const cursor = Number(url.searchParams.get('cursor') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 20);

      const getParams = (key: string) =>
        url.searchParams
          .getAll(key)
          .flatMap((v) => v.split(','))
          .map((v) => v.trim())
          .filter(Boolean);

      const fieldParams = getParams('field');
      const statusParams = getParams('status');
      const regionParams = getParams('region');
      const typeParams = getParams('type');

      const allExhibitions = listDisplays().filter((display: any) => {
        const matchesKeyword =
          !keyword ||
          display.title?.includes(keyword) ||
          display.schoolDepartmentName?.includes(keyword);

        const matchesField =
          fieldParams.length === 0 ||
          fieldParams.some(
            (f) =>
              display.displayFields?.includes(f) ||
              display.field === f ||
              display.department?.includes(f),
          );

        const matchesStatus =
          statusParams.length === 0 ||
          statusParams.some((s) => display.status === s || display.exhibitionStatus === s);

        const matchesRegion =
          regionParams.length === 0 ||
          regionParams.some((r) => display.region === r || display.locationRegion === r);

        const matchesType =
          typeParams.length === 0 ||
          typeParams.some((t) => display.type === t || display.exhibitionType === t);

        return matchesKeyword && matchesField && matchesStatus && matchesRegion && matchesType;
      });
      const exhibitions = allExhibitions.slice(cursor, cursor + size);
      const nextCursor = cursor + size < allExhibitions.length ? cursor + size : null;

      return success('/api/v1/display/search', {
        exhibitions,
        pagination: { nextCursor, size: exhibitions.length, hasNext: nextCursor !== null },
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/display/{displayId}',
        displayDetailResponse(toNumber(params.displayId, 101)),
      ),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/members').map((path) =>
    http.get(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const members = display.teamMembers ?? [];
      return success('/api/v1/display/{displayId}/members', {
        displayId,
        memberAccept: members.filter((m: any) => m.accepted !== false),
        memberPending: members.filter((m: any) => m.accepted === false),
      });
    }),
  ),
  /*
   * 초대 링크 활성/비활성 상태는 전시 상세(invitationToken/invitationDisabledAt)로 판단하므로
   * 응답만 만들지 말고 mockDb의 전시 데이터에 실제로 반영해야 토글이 유지됩니다.
   */
  ...paths('/api/v1/display/{displayId}/invitation').map((path) =>
    http.post(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      /*
       * 실제로는 재발급 시 새 토큰으로 교체되지만, MSW는 새로고침하면 상태가 초기화되어
       * 방금 만든 링크를 새 탭에서 열 수 없습니다. 확인 편의를 위해 고정 토큰을 씁니다.
       */
      const token = `mock-invitation-${displayId}`;

      display.invitationToken = token;
      display.invitationDisabledAt = null;

      return success('/api/v1/display/{displayId}/invitation', {
        displayId,
        invitationUrl: `${window.location.origin}/display/invitation/${token}`,
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/invitation').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const body = await readJson<{ enabled?: boolean }>(request);
      const invitationDisabledAt = body.enabled === false ? now() : null;

      display.invitationDisabledAt = invitationDisabledAt;

      return success('/api/v1/display/{displayId}/invitation', {
        displayId,
        enabled: body.enabled ?? false,
        invitationUrl: display.invitationDisabledAt ? null : display.invitationToken,
        invitationDisabledAt,
      });
    }),
  ),
  /*
   * 멤버 초대. 초대받은 사람이 팀원 목록에 '초대대기'로 보이도록
   * accepted=false 인 팀원을 전시 데이터에 추가합니다.
   */
  ...paths('/api/v1/display-invitations/displays/{displayId}').map((path) =>
    http.post(path, async ({ params, request }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const body = await readJson<{ inviteeUserId?: number }>(request);
      const inviteeUserId = Number(body.inviteeUserId ?? 0);

      const invitee = mockDb.searchableUsers.find((user: any) => user.userId === inviteeUserId);
      const members = display.teamMembers ?? [];
      const alreadyMember = members.some((member: any) => member.userId === inviteeUserId);

      if (inviteeUserId && !alreadyMember) {
        display.teamMembers = [
          ...members,
          {
            teamMemberId: Date.now(),
            userId: inviteeUserId,
            displayNickname: invitee?.nickname ?? `user-${inviteeUserId}`,
            role: 'TEAM_MEM',
            accepted: false,
          },
        ];
      }

      return created('/api/v1/display-invitations/displays/{displayId}', {
        invitationId: Date.now(),
        displayId,
        inviteeUserId,
        status: 'PENDING',
        createdAt: now(),
      });
    }),
  ),
  ...paths('/api/v1/display-invitations/me').map((path) =>
    http.get(path, () =>
      success('/api/v1/display-invitations/me', {
        invitations: mockDisplayInvitations.filter((invitation) => invitation.status === 'PENDING'),
      }),
    ),
  ),
  ...paths('/api/v1/display-invitations/{invitationId}/accept').map((path) =>
    http.post(path, async ({ params, request }) => {
      const invitationId = toNumber(params.invitationId, 1);
      const invitation = mockDisplayInvitations.find((item) => item.invitationId === invitationId);
      const body = await readJson<{ displayNickname?: string }>(request);

      if (invitation) {
        invitation.status = 'ACCEPTED';

        /*
         * 수락 시 전시 상세(teamMembers)에도 accepted=true로 반영해야 초대 수락 직후
         * displayArtistName.edit 등 멤버 권한 체크가 통과합니다. 여기를 빼먹으면
         * 팀원으로 수락했는데도 계속 403이 뜹니다.
         */
        const display = findDisplay(invitation.displayId);
        const members = display.teamMembers ?? [];
        const inviteeUserId = invitation.inviteeUserId;
        const existingMember = members.find((member: any) => member.userId === inviteeUserId);

        if (existingMember) {
          existingMember.accepted = true;
          if (body.displayNickname) existingMember.displayNickname = body.displayNickname;
        } else {
          display.teamMembers = [
            ...members,
            {
              teamMemberId: Date.now(),
              userId: inviteeUserId,
              displayNickname: body.displayNickname ?? invitation.userNickname ?? '팀원',
              role: 'TEAM_MEM',
              accepted: true,
            },
          ];
        }
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
    http.get(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const rawMembers = (display.teamMembers ?? []).length
        ? display.teamMembers
        : [
            {
              teamMemberId: 150,
              userId: mockDb.me.userId,
              displayNickname: `${display.title}작가명`,
              loggedIn: true,
              artistVerified: true,
              accepted: true,
              role: display.isLeader ? 'TEAM_LEADER' : 'TEAM_MEM',
            },
          ];
      const members = rawMembers.map((member: any) => ({
        loggedIn: true,
        artistVerified: false,
        ...member,
      }));

      return success('/api/v1/display/{displayId}/members', {
        displayId,
        memberAccept: members.filter((member: any) => member.accepted !== false),
        memberPending: members.filter((member: any) => member.accepted === false),
      });
    }),
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
      const body = await readJson<{ content?: string; images?: { imageUrl?: string }[] }>(request);
      const reviewId = mockDb.displayReviews.length + 1;
      const review = {
        displayReviewId: reviewId,
        reviewId,
        displayId: toNumber(params.displayId, 101),
        content: body.content ?? '',
        // 요청에는 imageUrl만 담기므로 조회 응답에 필요한 imageId를 채워줍니다.
        images: (body.images ?? []).map((image, index) => ({
          ...image,
          imageId: reviewId * 100 + index + 1,
        })),
        writer: mockDb.me,
        user: mockDb.me,
        likeCount: 0,
        replyCount: 0,
        createdAt: now(),
        updatedAt: now(),
      };
      // 최신 후기가 목록 아래에 표시되도록 뒤에 붙입니다.
      mockDb.displayReviews.push(review);

      return created('/api/v1/display/{displayId}/reviews', review);
    }),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}').map((path) =>
    http.delete(path, ({ params }) => {
      const displayReviewId = toNumber(params.displayReviewId);

      // 후기와 딸린 답글을 함께 제거합니다.
      mockDb.displayReviews = mockDb.displayReviews.filter(
        (review: any) => review.displayReviewId !== displayReviewId,
      );
      mockDb.displayReviewReplies = mockDb.displayReviewReplies.filter(
        (reply: any) => reply.displayReviewId !== displayReviewId,
      );

      return success('/api/v1/display/{displayId}/reviews/{displayReviewId}', {
        displayReviewId,
        deletedAt: now(),
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/like').map((path) =>
    http.post(path, ({ params }) =>
      success('/api/v1/display/{displayId}/reviews/{displayReviewId}/like', {
        displayReviewId: toNumber(params.displayReviewId),
        liked: true,
        likeCount: 1,
      }),
    ),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies').map((path) =>
    http.get(path, ({ params }) => {
      const displayReviewId = toNumber(params.displayReviewId, 1);
      const replies = mockDb.displayReviewReplies.filter(
        (reply: any) => reply.displayReviewId === displayReviewId,
      );

      return success('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies', {
        replies,
        nextCursorId: null,
        size: replies.length,
        hasNext: false,
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies').map((path) =>
    http.post(path, async ({ params, request }) => {
      const body = await readJson<{ content?: string }>(request);
      const displayReviewId = toNumber(params.displayReviewId, 1);
      const reply = {
        displayReviewReplyId: mockDb.displayReviewReplies.length + 1,
        displayReviewId,
        content: body.content ?? '',
        user: mockDb.me,
        isTeamMember: false,
        likeCount: 0,
        createdAt: now(),
      };

      mockDb.displayReviewReplies.push(reply);

      // 후기 목록의 댓글 수도 함께 늘려줍니다.
      const review = mockDb.displayReviews.find(
        (item: any) => item.displayReviewId === displayReviewId,
      );
      if (review) review.replyCount = (review.replyCount ?? 0) + 1;

      return created('/api/v1/display/{displayId}/reviews/{displayReviewId}/replies', reply);
    }),
  ),
  ...paths(
    '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}',
  ).map((path) =>
    http.delete(path, ({ params }) => {
      const displayReviewReplyId = toNumber(params.displayReviewReplyId);
      const displayReviewId = toNumber(params.displayReviewId, 1);

      mockDb.displayReviewReplies = mockDb.displayReviewReplies.filter(
        (reply: any) => reply.displayReviewReplyId !== displayReviewReplyId,
      );

      // 후기 목록의 댓글 수도 함께 줄여줍니다.
      const review = mockDb.displayReviews.find(
        (item: any) => item.displayReviewId === displayReviewId,
      );
      if (review) review.replyCount = Math.max(0, (review.replyCount ?? 0) - 1);

      return success(
        '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}',
        { displayReviewReplyId, deletedAt: now() },
      );
    }),
  ),
  ...paths(
    '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}/like',
  ).map((path) =>
    http.post(path, ({ params }) =>
      success(
        '/api/v1/display/{displayId}/reviews/{displayReviewId}/reply/{displayReviewReplyId}/like',
        {
          displayReviewReplyId: toNumber(params.displayReviewReplyId),
          liked: true,
          likeCount: 1,
        },
      ),
    ),
  ),
];
