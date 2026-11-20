/* eslint-disable @typescript-eslint/no-explicit-any */
import { delay, http } from 'msw';

import { isContentHiddenBeforeOpen } from '@/mocks/data/contentOpen';
import { findMockDisplay, mockDb, okStatus } from '@/mocks/data/repository';
import { teamOf } from '@/mocks/handlers/displayMember';
import { created, fail, noContent, paths, readJson, success, toNumber } from '@/mocks/response';
import { hasMockScenario } from '@/mocks/scenario';
import { compareBySort, matchesSearchWord } from '@/mocks/searchText';

const now = () => new Date().toISOString();

const listDisplays = () =>
  mockDb.displays.map((display: any) => ({
    ...display,
    posterImageUrl:
      display.posterImageUrl ??
      display.posterImages?.[0]?.imageUrl ??
      display.images?.[0]?.imageUrl,
  }));

let nextScreeningId = 1;
let nextPosterImageId = 10_000;

type MockPosterMedia = { imageUrl: string; mediaType: 'IMAGE' | 'VIDEO'; thumbnailUrl?: string };

const toMockPosterImage = (media: MockPosterMedia, sortOrder: number) => ({
  imageId: nextPosterImageId++,
  imageUrl: media.imageUrl,
  isThumbnail: sortOrder === 0,
  imageType: sortOrder === 0 ? 'MAIN' : 'DETAIL',
  caption: '',
  width: 0,
  height: 0,
  sortOrder,
  mediaType: media.mediaType,
  thumbnailUrl: media.mediaType === 'VIDEO' ? (media.thumbnailUrl ?? null) : null,
});

const cardUrlOf = (media: MockPosterMedia) =>
  media.mediaType === 'VIDEO' ? (media.thumbnailUrl ?? '') : media.imageUrl;

/* posterMedia · displayMedia 를 상세 images 와 목록 카드 필드(posterImageUrl · posterVideoUrl)에 반영합니다. 생략한 그룹은 그대로 둡니다 */
const applyPosterMedia = (
  display: any,
  body: { posterMedia?: MockPosterMedia; displayMedia?: MockPosterMedia[] },
) => {
  if (!body.posterMedia && !body.displayMedia) return;

  const current: MockPosterMedia[] = (display.images ?? display.posterImages ?? [])
    .slice()
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((image: any) => ({
      imageUrl: image.imageUrl,
      mediaType: image.mediaType ?? 'IMAGE',
      thumbnailUrl: image.thumbnailUrl ?? undefined,
    }));
  const main = body.posterMedia ?? current[0];
  const extras = body.displayMedia ?? current.slice(1);
  const media = [main, ...extras].filter(Boolean) as MockPosterMedia[];

  display.images = media.map(toMockPosterImage);
  display.posterImages = display.images;
  display.posterImageUrl = main ? cardUrlOf(main) : '';
  display.thumbnailUrl = display.posterImageUrl;
  display.posterVideoUrl = main?.mediaType === 'VIDEO' ? main.imageUrl : null;
};

const findDisplay = (displayId: number) => findMockDisplay(displayId) ?? mockDb.displays[0];

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
    currentScreeningId:
      display.status === 'PENDING_REVIEW' ? (display.currentScreeningId ?? null) : null,
    posterCrop: display.posterCrop ?? null,
    posterFit: display.posterFit ?? null,
    posterEdgeColor: display.posterEdgeColor ?? null,
    invitationToken: display.invitationToken ?? null,
    invitationDisabledAt: display.invitationDisabledAt ?? null,
    teamMembers: display.teamMembers ?? [],
    invitations: display.invitations ?? [],
    contentCategories: display.contentCategories ?? [],
    images: display.images ?? display.posterImages ?? [],
    artworkContentOpen: display.artworkContentOpen ?? 'ON_EXHIBITION',
    exhibitionContentOpen: display.exhibitionContentOpen ?? 'ON_EXHIBITION',
    // 실서버처럼 공개 시점 전이어도 목록은 그대로 주고 공개 여부만 알린다
    artworkContentVisible: !isContentHiddenBeforeOpen(display, 'artwork'),
    exhibitionContentVisible: !isContentHiddenBeforeOpen(display, 'exhibition'),
    period: display.period ?? {
      startDate: display.startedAt,
      endDate: display.endedAt,
      startTime: display.startTime,
      endTime: display.endTime,
    },
    location:
      display.location && typeof display.location === 'object'
        ? display.location
        : {
            placeName: display.placeName,
            roadAddress: '서울특별시 마포구 와우산로 94',
            latitude: 37.5509,
            longitude: 126.9254,
          },
    /* 전시 링크: 101은 둘 다, 102는 인스타그램만, 나머지는 없음 */
    instagramUrl:
      display.instagramUrl ??
      (display.displayId === 101 || display.displayId === 102
        ? 'https://www.instagram.com/soft_landing_2026/'
        : null),
    websiteUrl:
      display.websiteUrl ?? (display.displayId === 101 ? 'https://softlanding.kr/' : null),
  };
};

/* 목 전시는 모두 내가 대표자라, 관리자 · 팀원 화면은 ?mock=display-manager | display-member 로 확인한다 */
const MOCK_OTHER_LEADER_ID = 9001;

const withMockTeamRole = (detail: ReturnType<typeof displayDetailResponse>) => {
  const role = hasMockScenario('display-manager')
    ? 'MANAGER'
    : hasMockScenario('display-member')
      ? 'TEAM_MEM'
      : null;
  if (!role) return detail;

  const myUserId = mockDb.me.userId;
  return {
    ...detail,
    ownerUserId: MOCK_OTHER_LEADER_ID,
    teamMembers: [
      {
        teamMemberId: MOCK_OTHER_LEADER_ID,
        userId: MOCK_OTHER_LEADER_ID,
        displayNickname: '김도윤',
        role: 'TEAM_LEADER',
        accepted: true,
      },
      ...detail.teamMembers.filter((member: any) => member.userId !== myUserId),
      {
        teamMemberId: myUserId,
        userId: myUserId,
        displayNickname: '디스플레이유',
        role,
        accepted: true,
      },
    ],
  };
};

const MY_DISPLAY_PUBLISH_STATUSES = [
  'PUBLISHED',
  'DRAFT',
  'PENDING_REVIEW',
  'REJECTED',
  'PUBLISHED',
  'PUBLISHED',
] as const;

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
  posterVideoUrl: display.posterVideoUrl ?? null,
  posterCrop: display.posterCrop ?? null,
  posterFit: display.posterFit ?? null,
  posterEdgeColor: display.posterEdgeColor ?? null,
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

/* 실서버처럼 포스터 범위 값은 소수점 이하 10자리까지만 받는다 */
const CROP_KEYS = ['x', 'y', 'w', 'h'] as const;
const invalidPosterCrop = (path: string, crop: unknown) => {
  if (!crop || typeof crop !== 'object') return null;
  const key = CROP_KEYS.find((cropKey) => {
    const value = (crop as Record<string, unknown>)[cropKey];
    return typeof value === 'number' && Number(value.toFixed(10)) !== value;
  });
  if (!key) return null;

  return fail(path, 400, 'INVALID_INPUT_VALUE', '입력값이 올바르지 않습니다.', [
    { field: `posterCrop.${key}`, message: '숫자 값이 한계를 초과합니다(<1 자리>.<10 자리> 예상)' },
  ]);
};

export const displayHandlers = [
  ...paths('/api/v1/display').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const cropError = invalidPosterCrop('/api/v1/display', body.posterCrop);
      if (cropError) return cropError;

      const displayId = Math.max(...mockDb.displays.map((display: any) => display.displayId)) + 1;
      const display = {
        ...findDisplay(101),
        ...body,
        displayId,
        title: String(body.title ?? '새 전시'),
        invitationToken: `mock-invitation-${displayId}`,
        images: [],
        posterImages: [],
        posterVideoUrl: null,
        // 템플릿(101)의 썸네일 조정 값을 물려받지 않게 요청 값만 쓴다
        posterCrop: body.posterCrop ?? null,
        posterFit: body.posterFit ?? null,
        posterEdgeColor: body.posterEdgeColor ?? null,
      };

      applyPosterMedia(display, body as Parameters<typeof applyPosterMedia>[1]);
      mockDb.displays.unshift(display);

      return created('/api/v1/display', { displayId, ...display });
    }),
  ),
  // PATCH /api/v1/display: 전시 수정. 스웨거 UpdateDisplayRequest 필드만 반영합니다.
  ...paths('/api/v1/display').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<Record<string, any>>(request);
      const cropError = invalidPosterCrop('/api/v1/display', body.posterCrop);
      if (cropError) return cropError;

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
      const mainPosterUrl = () =>
        (display.images ?? display.posterImages ?? [])
          .slice()
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)[0]?.imageUrl ??
        display.posterImageUrl;
      const prevPosterUrl = mainPosterUrl();
      assign('posterImageUrl', body.posterImageUrl);
      assign('thumbnailUrl', body.posterImageUrl);
      applyPosterMedia(display, body);
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

      // 스웨거: 링크 · 위치 · 포스터 범위는 null 이면 기존 값 유지, 링크는 빈 문자열이면 삭제
      if (body.instagramUrl != null) display.instagramUrl = body.instagramUrl;
      if (body.websiteUrl != null) display.websiteUrl = body.websiteUrl;
      if (body.roadAddress != null) {
        display.location = {
          placeName: body.placeName ?? display.placeName,
          roadAddress: body.roadAddress,
          latitude: body.latitude ?? display.location?.latitude,
          longitude: body.longitude ?? display.location?.longitude,
        };
      } else if (body.placeName !== undefined && display.location) {
        display.location = { ...display.location, placeName: body.placeName };
      }
      assign('region', body.region ?? undefined);
      // 실서버처럼 대표 포스터 주소가 바뀌면 기존 범위를 버린다
      if (mainPosterUrl() !== prevPosterUrl) {
        display.posterCrop = body.posterCrop ?? null;
        display.posterFit = body.posterFit ?? null;
        display.posterEdgeColor = body.posterEdgeColor ?? null;
      } else {
        assign('posterCrop', body.posterCrop ?? undefined);
        assign('posterFit', body.posterFit ?? undefined);
        assign('posterEdgeColor', body.posterEdgeColor ?? undefined);
      }

      return success('/api/v1/display', display);
    }),
  ),
  ...paths('/api/v1/display/publish').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<{ displayId?: number }>(request);
      const displayId = body.displayId ?? 101;
      const display = findDisplay(displayId);
      display.status = 'PENDING_REVIEW';
      display.currentScreeningId = nextScreeningId++;

      return success('/api/v1/display/publish', displayDetailResponse(displayId));
    }),
  ),
  ...paths('/api/v1/display/{displayId}/draft').map((path) =>
    http.patch(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      findDisplay(displayId).status = 'DRAFT';

      return success('/api/v1/display/{displayId}/draft', displayDetailResponse(displayId));
    }),
  ),
  ...paths('/api/v1/display/{displayId}/screenings/{screeningId}/cancel').map((path) =>
    http.post(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const screeningId = toNumber(params.screeningId, 0);
      const display = findDisplay(displayId);

      if (display.status !== 'PENDING_REVIEW' || display.currentScreeningId !== screeningId) {
        return fail(
          '/api/v1/display/{displayId}/screenings/{screeningId}/cancel',
          409,
          'DISPLAY_SCREENING_NOT_PENDING',
          '이미 처리된 심사 요청이에요.',
        );
      }

      display.status = 'DRAFT';
      display.currentScreeningId = null;

      return success('/api/v1/display/{displayId}/screenings/{screeningId}/cancel', {
        displayId,
        screeningId,
        status: 'DRAFT',
        screeningStatus: 'CANCELLED',
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/rejection-reason').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/display/{displayId}/rejection-reason', {
        displayId: toNumber(params.displayId, 101),
        publishStatus: 'REJECTED',
        rejectionReason: '이미지 출처를 확인할 수 없어요',
      }),
    ),
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
  ...paths('/api/v1/display/popular').map((path) =>
    http.get(path, () =>
      success('/api/v1/display/popular', { exhibitions: listDisplays().slice(0, 10) }),
    ),
  ),
  ...paths('/api/v1/display/graduation').map((path) =>
    http.get(path, () => success('/api/v1/display/graduation', { exhibitions: listDisplays() })),
  ),
  /*
   * 스웨거: 초대 토큰으로 전시 상세를 조회합니다(PUBLIC).
   * 팀원 관리에서 켠 링크(mock-invitation-{displayId})만 성공하고, 꺼졌거나 모르는 토큰은 실서버처럼 실패한다.
   * 화면 확인용: mock-loading 은 응답하지 않고(확인 중), mock-server-error 는 500 을 내려준다.
   */
  ...paths('/api/v1/display/invitation/{token}').map((path) =>
    http.get(path, async ({ params }) => {
      const token = String(params.token);
      const route = '/api/v1/display/invitation/{token}';

      if (token === 'mock-loading') await delay('infinite');
      if (token === 'mock-server-error') {
        return fail(route, 500, 'INTERNAL_SERVER_ERROR', '서버 오류가 발생했어요.');
      }

      const display = mockDb.displays.find((entry: any) => entry.invitationToken === token);
      if (!display) {
        return fail(route, 404, 'INVALID_DISPLAY_INVITATION_TOKEN', '유효하지 않은 초대 링크예요.');
      }
      if (display.invitationDisabledAt) {
        return fail(route, 409, 'DISPLAY_INVITATION_DISABLED', '비활성화된 초대 링크예요.');
      }

      return success(route, displayDetailResponse(display.displayId));
    }),
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
      const searchWord = searchParams.get('searchWord');
      const all = searchParams.get('all') === 'true';
      const cursor = Number(searchParams.get('cursor') ?? 0);
      const size = Number(searchParams.get('size') ?? 20);
      const hasBounds = Object.values(bounds).every(Number.isFinite);
      const start = Number.isFinite(cursor) ? cursor : 0;
      // 서버는 한국 날짜 기준 오늘 끝나는 전시까지 돌려준다
      const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

      if (all && searchParams.has('cursor')) {
        return fail(
          '/api/v1/display/map',
          400,
          'INVALID_PARAMETER',
          'all 과 cursor 는 함께 보낼 수 없어요.',
        );
      }

      const filteredMarkers = listDisplays()
        .map((display: any) => {
          const coordinates = DISPLAY_MAP_COORDINATES[display.displayId];
          // 검색 대상: 전시명 · 장소명 · 학교명 · 세부 소속
          const matchesSearch = matchesSearchWord(searchWord, [
            display.title,
            display.location?.placeName ?? display.placeName,
            display.organization,
            display.department,
            display.schoolDepartmentName,
          ]);

          if (!coordinates || !matchesSearch) {
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
        .filter((marker: any) => marker && marker.endDate >= today)
        .filter(
          (marker: any) => !hasBounds || isInsideBounds(marker.latitude, marker.longitude, bounds),
        );

      if (all) {
        return success('/api/v1/display/map', {
          markers: filteredMarkers,
          pagination: { nextCursor: null, size: filteredMarkers.length, hasNext: false },
        });
      }

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
        // 실서버처럼 공개 여부와 대표자 여부를 담아, 내 전시 관리 카드의 상태를 모두 확인할 수 있게 한다
        createdDisplays: listDisplays()
          .slice(0, 3)
          .map((display: any, index: number) => ({
            ...myDisplayItem(display),
            isLeader: true,
            role: 'TEAM_LEADER',
            publishStatus: MY_DISPLAY_PUBLISH_STATUSES[index],
          })),
        participatedDisplays: listDisplays()
          .slice(3, 6)
          .map((display: any, index: number) => ({
            ...myDisplayItem(display),
            isLeader: false,
            // 참여한 전시 중 첫 번째는 관리자로 지정된 전시
            role: index === 0 ? 'MANAGER' : 'TEAM_MEM',
            publishStatus: MY_DISPLAY_PUBLISH_STATUSES[index + 3],
          })),
      }),
    ),
  ),
  ...paths('/api/v1/display/artists/{userId}').map((path) =>
    http.get(path, ({ params }) => {
      const userId = Number(params.userId);
      // 내 작가 페이지는 내 전시 중 공개된 것만, 다른 작가는 전시 중 · 예정 · 종료가 섞인 전시를 보여 준다
      if (userId === mockDb.me.userId) {
        return success('/api/v1/display/artists/{userId}', {
          createdDisplays: listDisplays()
            .slice(0, 1)
            .map((display: any) => ({ ...myDisplayItem(display), isLeader: true })),
          participatedDisplays: listDisplays()
            .slice(4, 6)
            .map((display: any) => ({ ...myDisplayItem(display), isLeader: false })),
        });
      }

      const day = (offset: number) =>
        new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
      const schedules = [
        { displayStatus: 'DISPLAYING', startDate: day(-3), endDate: day(10) },
        { displayStatus: 'UPCOMING', startDate: day(14), endDate: day(24) },
        {},
        {},
      ];
      const items = listDisplays()
        .slice(1, 1 + schedules.length)
        .map((display: any, index: number) => ({
          ...myDisplayItem(display),
          ...schedules[index],
          displayNickname: `작가${userId}`,
          artistName: `작가${userId}`,
        }));

      return success('/api/v1/display/artists/{userId}', {
        createdDisplays: items.slice(0, 2).map((item: any) => ({ ...item, isLeader: true })),
        participatedDisplays: items.slice(2).map((item: any) => ({ ...item, isLeader: false })),
      });
    }),
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
        // 실서버처럼 그 전시 작품에 실린 내 이름(대표 · 공동 작가)도 전시 작가명을 따른다.
        // 목에서 새로 등록한 작품은 artistUserId 가 없으면 내 작품이다
        const myUserId = mockDb.me.userId;
        mockDb.artworks
          .filter((artwork: any) => artwork.displayId === body.displayId)
          .forEach((artwork: any) => {
            if ((artwork.artistUserId ?? myUserId) === myUserId) {
              artwork.artistName = body.displayNickname;
              artwork.artist = body.displayNickname;
            }
            [...(artwork.artists ?? []), ...(artwork.coAuthors ?? [])].forEach((author: any) => {
              if (author.userId === myUserId) author.name = body.displayNickname;
            });
          });
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

      const sort = url.searchParams.get('sort');

      const allExhibitions = listDisplays().filter((display: any) => {
        // 탐색 정책: 전시명 · 학교명 · 세부 소속(학과 · 학회 · 동아리명)
        const matchesKeyword = matchesSearchWord(keyword, [
          display.title,
          display.organization,
          display.department,
          display.schoolDepartmentName,
        ]);

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
          typeParams.some(
            (t) => display.displayType === t || display.type === t || display.exhibitionType === t,
          );

        return matchesKeyword && matchesField && matchesStatus && matchesRegion && matchesType;
      });
      allExhibitions.sort(
        compareBySort(
          sort,
          (display: any) => display.likeCount ?? 0,
          (display: any) => [display.displayId],
        ),
      );
      const exhibitions = allExhibitions.slice(cursor, cursor + size);
      const nextCursor = cursor + size < allExhibitions.length ? cursor + size : null;
      const last = exhibitions.at(-1);

      return success('/api/v1/display/search', {
        exhibitions,
        pagination: {
          nextCursor,
          size: exhibitions.length,
          hasNext: nextCursor !== null,
          // 목은 커서를 순번으로 쓰므로 cursorLikeCount 를 받아도 쓰지 않는다
          ...(sort === 'LIKES' && last && { nextCursorLikeCount: last.likeCount ?? 0 }),
        },
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}').map((path) =>
    http.get(path, ({ params }) =>
      success(
        '/api/v1/display/{displayId}',
        withMockTeamRole(displayDetailResponse(toNumber(params.displayId, 101))),
      ),
    ),
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
      const invitationId = Date.now();

      if (inviteeUserId && !alreadyMember) {
        display.teamMembers = [
          ...members,
          {
            // 초대 대기는 실서버처럼 teamMemberId 가 없고 invitationId 로 취소한다
            teamMemberId: null,
            userId: inviteeUserId,
            displayNickname: invitee?.nickname ?? `user-${inviteeUserId}`,
            role: 'TEAM_MEM',
            accepted: false,
            invitationId,
          },
        ];
      }

      return created('/api/v1/display-invitations/displays/{displayId}', {
        invitationId,
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
        // 팀원 관리 목과 같은 팀에서 시작해야 수락 뒤 팀원 관리 화면에 대표자 · 팀원이 그대로 보인다
        const members = teamOf(display);
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
