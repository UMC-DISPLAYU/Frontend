import type {
  DisplayDetailDto,
  DisplayListItemDto,
  DuPickDto,
  HomeExhibitionDto,
} from '@/api/dto';
import {
  MOCK_DISPLAY_FIXTURE_BY_ID,
  MOCK_DISPLAY_FIXTURES,
  MOCK_UPLOAD_IMAGE_URL,
  type MockDisplayFixture,
} from '@/mocks/data';
import type { ReviewItem } from '@/types/exhibition';

export interface MockDisplaySearchItem extends DisplayListItemDto {
  field: string;
  region: string;
  status: string;
  type: string;
}

const toHomeExhibition = (display: MockDisplayFixture): HomeExhibitionDto => ({
  displayId: display.displayId,
  title: display.title,
  posterImageUrl: display.posterImages[0].imageUrl,
  organization: display.organization,
  department: display.department,
  startedAt: display.startedAt,
  endedAt: display.endedAt,
  dayLeft: display.dayLeft,
});

const toSearchItem = (display: MockDisplayFixture): MockDisplaySearchItem => ({
  ...toHomeExhibition(display),
  field: display.displayFields[0],
  region: display.region,
  status: display.status,
  type: display.displayType,
});

const toDisplayImages = (display: MockDisplayFixture) =>
  display.posterImages.map((image, index) => ({
    imageId: display.displayId * 100 + index + 1,
    imageUrl: image.imageUrl,
    imageType: 'POSTER',
    width: image.width,
    height: image.height,
    sortOrder: index + 1,
  }));

const toContentCategories = (display: MockDisplayFixture) =>
  display.contentCategories.map((category, categoryIndex) => ({
    categoryId: display.displayId * 100 + categoryIndex + 1,
    name: category.name,
    description: category.description,
    sortOrder: categoryIndex + 1,
    contents: category.images.map((image, imageIndex) => ({
      contentId: display.displayId * 1000 + categoryIndex * 100 + imageIndex + 1,
      imageUrl: image.imageUrl,
      width: image.width,
      height: image.height,
      sortOrder: imageIndex + 1,
    })),
  }));

const toDisplayDetail = (display: MockDisplayFixture): DisplayDetailDto => ({
  displayId: display.displayId,
  ownerUserId: 900 + display.displayId,
  title: display.title,
  subtitle: display.subtitle,
  content: display.content,
  location: {
    placeName: display.placeName,
    latitude: 37.5665,
    longitude: 126.978,
  },
  qnaAccount: display.qnaAccount,
  note: display.note,
  organization: display.organization,
  department: display.department,
  displayType: display.displayType,
  displayFields: display.displayFields,
  region: display.region,
  likeCount: 100 + display.displayId,
  period: {
    startDate: display.startedAt,
    endDate: display.endedAt,
    startTime: display.startTime,
    endTime: display.endTime,
  },
  artworkContentOpen: 'IMMEDIATELY',
  exhibitionContentOpen: 'ON_EXHIBITION',
  status: display.status,
  invitationToken: null,
  invitationDisabledAt: null,
  images: toDisplayImages(display),
  contentCategories: toContentCategories(display),
  teamMembers: [],
  invitations: [],
});

export const MOCK_GRADUATION_DISPLAYS: HomeExhibitionDto[] = MOCK_DISPLAY_FIXTURES.filter(
  (display) => display.displayType === 'GRADUATION',
).map(toHomeExhibition);

export const MOCK_CLOSING_SOON_DISPLAYS: HomeExhibitionDto[] = [101, 105, 106]
  .map((displayId) => MOCK_DISPLAY_FIXTURE_BY_ID[displayId])
  .filter(Boolean)
  .map(toHomeExhibition);

export const MOCK_DUPICKS: DuPickDto[] = MOCK_DISPLAY_FIXTURES.slice(0, 4).map(
  (display, index) => ({
    duPickId: 301 + index,
    title: display.title,
    subtitle: display.subtitle ?? `${display.organization} ${display.department}`,
    bannerImageUrl: display.posterImages[0].imageUrl,
    createdAt: `2026-07-${String(index + 1).padStart(2, '0')}T09:00:00`,
  }),
);

export const MOCK_DISPLAY_SEARCH_RESULT: MockDisplaySearchItem[] =
  MOCK_DISPLAY_FIXTURES.map(toSearchItem);

export const MOCK_DISPLAY_DETAILS: Record<number, DisplayDetailDto> = {
  ...Object.fromEntries(
    MOCK_DISPLAY_FIXTURES.map((display) => [display.displayId, toDisplayDetail(display)]),
  ),
  1: toDisplayDetail(MOCK_DISPLAY_FIXTURES[0]),
};

export const MOCK_CREATED_DISPLAY_POSTER_URL = MOCK_UPLOAD_IMAGE_URL;

export const MOCK_EXHIBITIONS = MOCK_GRADUATION_DISPLAYS;

export const MOCK_DISPLAY_REVIEWS: Record<string, ReviewItem[]> = Object.fromEntries(
  MOCK_DISPLAY_FIXTURES.map((display) => [
    String(display.displayId),
    [
      {
        id: `${display.displayId}-1`,
        author: '전시러버',
        avatarColor: 'bg-orange-200',
        rating: 5,
        content: `${display.title} 전시의 공간 구성과 작품 배치가 인상 깊었어요. 다시 보고 싶은 전시입니다.`,
        date: '2026.06.25',
        likes: 12,
        images: display.contentCategories[0]?.images.slice(0, 2).map((image) => image.imageUrl),
      },
      {
        id: `${display.displayId}-2`,
        author: 'displayu_user',
        avatarColor: 'bg-violet-200',
        rating: 4,
        content: '작품 설명과 동선이 잘 이어져서 관람 흐름이 편했습니다.',
        date: '2026.06.26',
        likes: 7,
      },
    ],
  ]),
);
