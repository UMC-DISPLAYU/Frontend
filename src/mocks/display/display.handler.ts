import { http } from 'msw';

import { MOCK_PROFILE_IMAGES } from '@/mocks/data';
import { createSuccessJson, cursorPagination } from '@/mocks/response';

import {
  MOCK_CLOSING_SOON_DISPLAYS,
  MOCK_CREATED_DISPLAY_POSTER_URL,
  MOCK_DISPLAY_DETAILS,
  MOCK_DISPLAY_REVIEWS,
  MOCK_DISPLAY_SEARCH_RESULT,
  MOCK_DUPICKS,
  MOCK_GRADUATION_DISPLAYS,
} from './display.mock';

const toDisplayListItem = (display: (typeof MOCK_DISPLAY_SEARCH_RESULT)[number]) => ({
  displayId: display.displayId,
  title: display.title,
  posterImageUrl: display.posterImageUrl,
  organization: display.organization,
  department: display.department,
  startedAt: display.startedAt,
  endedAt: display.endedAt,
  dayLeft: display.dayLeft,
});

export const displayHandlers = [
  http.post('*/v1/display', async ({ request }) => {
    const body = (await request.json()) as {
      title?: string;
      posterImageUrl?: string;
      type?: string;
      fields?: string[];
      region?: string;
      startDate?: string;
      endDate?: string;
      openTime?: string;
      closeTime?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
      schoolOrOrganization?: string;
      departmentOrClub?: string;
      hostOrganizationName?: string;
      subtitle?: string;
      description?: string;
      precautions?: string;
    };
    const pathname = new URL(request.url).pathname;

    return createSuccessJson(pathname, {
      displayId: 9901,
      ownerUserId: 9001,
      title: body.title ?? 'MOCK 등록 전시',
      subtitle: body.subtitle ?? null,
      content: body.description ?? null,
      location: {
        placeName: body.locationName ?? 'MOCK 임시 전시장',
        latitude: body.latitude ?? 37.5665,
        longitude: body.longitude ?? 126.978,
      },
      qnaAccount: 'mock-displayu',
      note: body.precautions ?? null,
      organization: body.schoolOrOrganization ?? body.hostOrganizationName ?? null,
      department: body.departmentOrClub ?? null,
      displayType: body.type ?? 'MOCK_TYPE',
      displayFields: body.fields ?? ['MOCK_FIELD'],
      region: body.region ?? 'SEOUL',
      likeCount: 0,
      period: {
        startDate: body.startDate ?? '2026-07-01',
        endDate: body.endDate ?? '2026-07-14',
        startTime: body.openTime ?? '10:00',
        endTime: body.closeTime ?? '18:00',
      },
      artworkContentOpen: 'PUBLIC',
      exhibitionContentOpen: 'PUBLIC',
      status: 'UPCOMING',
      invitationToken: null,
      invitationDisabledAt: null,
      images: [
        {
          imageId: 990101,
          imageUrl: body.posterImageUrl ?? MOCK_CREATED_DISPLAY_POSTER_URL,
          imageType: 'POSTER',
          width: 360,
          height: 480,
          sortOrder: 1,
        },
      ],
      contentCategories: [],
      teamMembers: [],
      invitations: [],
    });
  }),

  http.get('*/v1/display/graduation', ({ request }) => {
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? MOCK_GRADUATION_DISPLAYS.length);

    return createSuccessJson(url.pathname, {
      exhibitions: MOCK_GRADUATION_DISPLAYS.slice(0, size),
    });
  }),

  http.get('*/v1/display/closing-soon', ({ request }) => {
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? MOCK_CLOSING_SOON_DISPLAYS.length);

    return createSuccessJson(url.pathname, {
      exhibitions: MOCK_CLOSING_SOON_DISPLAYS.slice(0, size),
      pagination: cursorPagination<string>(null, size),
    });
  }),

  http.get('*/v1/display/du-picks', ({ request }) => {
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? MOCK_DUPICKS.length);

    return createSuccessJson(url.pathname, {
      duPicks: MOCK_DUPICKS.slice(0, size),
      pagination: cursorPagination<number>(null, size),
    });
  }),

  http.get('*/v1/display/search', ({ request }) => {
    const url = new URL(request.url);
    const searchWord = url.searchParams.get('searchWord')?.trim().toLowerCase();
    const field = url.searchParams.get('field');
    const region = url.searchParams.get('region');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const size = Number(url.searchParams.get('size') ?? MOCK_DISPLAY_SEARCH_RESULT.length);
    const exhibitions = MOCK_DISPLAY_SEARCH_RESULT.filter((display) => {
      if (searchWord && !display.title.toLowerCase().includes(searchWord)) return false;
      if (field && display.field !== field) return false;
      if (region && region !== 'ALL' && display.region !== region) return false;
      if (status && display.status !== status) return false;
      if (type && display.type !== type) return false;

      return true;
    }).map(toDisplayListItem);

    return createSuccessJson(url.pathname, {
      exhibitions: exhibitions.slice(0, size),
      pagination: cursorPagination<number>(null, size),
    });
  }),

  http.get('*/v1/display/:displayId/reviews', ({ params, request }) => {
    const url = new URL(request.url);
    const displayId = String(params.displayId);
    const size = Number(url.searchParams.get('size') ?? MOCK_DISPLAY_REVIEWS[displayId]?.length ?? 0);
    const reviews = MOCK_DISPLAY_REVIEWS[displayId] ?? [];

    return createSuccessJson(url.pathname, {
      reviews: reviews.slice(0, size).map((review, index) => ({
        displayReviewId: Number(review.id.split('-').at(-1)) || Number(review.id),
        content: review.content,
        createdAt: review.date,
        user: {
          userId: 700 + index,
          nickname: review.author,
          profileImageUrl: MOCK_PROFILE_IMAGES[index % MOCK_PROFILE_IMAGES.length].imageUrl,
        },
        images: (review.images ?? []).map((imageUrl, imageIndex) => ({
          imageId: Number(`${displayId}${index}${imageIndex}`),
          imageUrl,
          isThumbnail: imageIndex === 0,
          imageType: 'DISPLAY_REVIEW',
          sortOrder: imageIndex + 1,
          caption: 'MOCK 전시 후기 이미지',
          width: 200,
          height: 200,
        })),
        likeCount: review.likes,
        replyCount: 0,
      })),
      nextCursorId: null,
      size,
      hasNext: false,
    });
  }),

  http.get('*/v1/display/:displayId', ({ params, request }) => {
    const displayId = Number(params.displayId);

    return createSuccessJson(
      new URL(request.url).pathname,
      MOCK_DISPLAY_DETAILS[displayId] ?? MOCK_DISPLAY_DETAILS[1],
    );
  }),
];
