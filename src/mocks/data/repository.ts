/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_ARTWORK, MOCK_DISPLAY } from '@/mocks/data';

const now = () => new Date().toISOString();

type MockDisplayDetail = (typeof MOCK_DISPLAY)[number] & {
  artworkSection: {
    title: '작품';
    artworks: (typeof MOCK_ARTWORK)[number][];
  };
};

// 파일 업로드 mock 응답과 이미지 fallback에서 반환할 대표 이미지 URL입니다.
export const MOCK_UPLOAD_IMAGE_URL = MOCK_DISPLAY[0].posterSection.images[0]?.imageUrl;

// 전시 상세 응답에 작품 섹션을 붙일 때 displayId별 작품 목록을 찾기 위한 조회 맵입니다.
const MOCK_ARTWORKS_BY_DISPLAY_ID = MOCK_ARTWORK.reduce<
  Record<number, (typeof MOCK_ARTWORK)[number][]>
>((artworksByDisplayId, artwork) => {
  artworksByDisplayId[artwork.displayId] ??= [];
  artworksByDisplayId[artwork.displayId].push(artwork);
  return artworksByDisplayId;
}, {});

// 전시 기본 데이터에 해당 전시의 작품 목록을 합쳐 전시 상세 응답 형태로 만든 데이터입니다.
const MOCK_DISPLAY_DETAILS: MockDisplayDetail[] = MOCK_DISPLAY.map((display) => ({
  ...display,
  artworkSection: {
    title: '작품',
    artworks: MOCK_ARTWORKS_BY_DISPLAY_ID[display.displayId] ?? [],
  },
}));

const makeUser = (userId = 1) => ({
  userId,
  id: userId,
  email: 'displayu@example.com',
  nickname: '디스플레이유',
  name: '디스플레이유',
  profileImageUrl: null,
  role: 'USER',
  provider: 'KAKAO',
  school: '홍익대학교',
  schoolEmail: 'displayu@hongik.ac.kr',
  isEmailVerified: true,
  createdAt: now(),
  updatedAt: now(),
});

const displayToListItem = (display: (typeof MOCK_DISPLAY_DETAILS)[number]) => ({
  displayId: display.displayId,
  exhibitionId: display.displayId,
  id: display.displayId,
  title: display.title,
  name: display.title,
  subtitle: display.subtitle,
  content: display.content,
  organization: display.organization,
  department: display.department,
  displayType: display.displayType,
  displayFields: display.displayFields,
  region: display.region,
  status: display.status,
  startedAt: display.startedAt,
  endedAt: display.endedAt,
  startDate: display.startedAt,
  endDate: display.endedAt,
  startTime: display.startTime,
  endTime: display.endTime,
  dayLeft: display.dayLeft,
  placeName: display.placeName,
  qnaAccount: display.qnaAccount,
  note: display.note,
  posterImageUrl: display.posterSection.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  thumbnailUrl: display.posterSection.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  likeCount: 12 + display.displayId,
  liked: false,
  archived: false,
});

const displayToDetail = (display: (typeof MOCK_DISPLAY_DETAILS)[number]) => ({
  ...displayToListItem(display),
  posterImages: display.posterSection.images.map((image, index) => ({
    imageId: display.displayId * 100 + index + 1,
    posterImageId: display.displayId * 100 + index + 1,
    imageUrl: image.imageUrl,
    width: 1600,
    height: 1600,
    sortOrder: index + 1,
  })),
  contentCategories: display.contentSection.categories.map((category, categoryIndex) => ({
    categoryId: display.displayId * 1000 + categoryIndex + 1,
    displayId: display.displayId,
    name: category.name,
    title: category.name,
    description: category.description,
    sortOrder: categoryIndex + 1,
    contents: category.images.map((image, imageIndex) => ({
      contentId: display.displayId * 10000 + categoryIndex * 100 + imageIndex + 1,
      imageId: display.displayId * 10000 + categoryIndex * 100 + imageIndex + 1,
      imageUrl: image.imageUrl,
      width: 1600,
      height: 1600,
      sortOrder: imageIndex + 1,
    })),
  })),
  artworks: display.artworkSection.artworks.map((artwork, index) => ({
    artworkId: artwork.artworkId,
    displayId: artwork.displayId,
    title: artwork.title,
    artist: artwork.artist,
    artistName: artwork.artist,
    content: artwork.description,
    description: artwork.description,
    type: artwork.type,
    productionYear: artwork.productionYear,
    materialMedia: artwork.material,
    material: artwork.material,
    size: artwork.size,
    point: artwork.point,
    order: index + 1,
    thumbnailUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
    imageUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  })),
});

const artworkToDetail = (artwork: any) => ({
  artworkId: artwork.artworkId,
  id: artwork.artworkId,
  displayId: artwork.displayId,
  title: artwork.title,
  artworkName: artwork.title,
  artist: artwork.artist,
  artistName: artwork.artist,
  artworkImageUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  imageWidth: 1600,
  imageHeight: 1600,
  exhibitionInfo: {
    displayId: artwork.displayId,
    exhibitionTitle:
      MOCK_DISPLAY_DETAILS.find((display) => display.displayId === artwork.displayId)?.title ?? '',
    exhibitionPeriod: '',
    exhibitionLocation:
      MOCK_DISPLAY_DETAILS.find((display) => display.displayId === artwork.displayId)?.placeName ??
      '',
  },
  content: artwork.description,
  description: artwork.description,
  type: artwork.type,
  productionYear: artwork.productionYear,
  materialMedia: artwork.material,
  material: artwork.material,
  size: artwork.size,
  point: artwork.point,
  liked: false,
  likeCount: 3,
  thumbnailUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  images: artwork.images.map((image: any, index: number) => ({
    imageId: artwork.artworkId * 100 + index + 1,
    artworkImageId: artwork.artworkId * 100 + index + 1,
    imageUrl: image.imageUrl,
    width: 1600,
    height: 1600,
    sortOrder: index + 1,
  })),
  processImages: (artwork.processImages ?? []).map((image: any, index: number) => ({
    imageId: artwork.artworkId * 1000 + index + 1,
    artworkImageId: artwork.artworkId * 1000 + index + 1,
    imageUrl: image.imageUrl,
    width: 1600,
    height: 1600,
    sortOrder: index + 1,
  })),
});

export const mockDb: {
  [key: string]: any;
} = {
  me: makeUser(),
  displays: MOCK_DISPLAY_DETAILS.map(displayToDetail),
  artworks: MOCK_DISPLAY_DETAILS.flatMap((display) =>
    display.artworkSection.artworks.map(artworkToDetail),
  ),
  loungePosts: [
    {
      loungePostId: 1,
      postId: 1,
      title: '전시 준비 팁 공유합니다',
      content: '포스터, 캡션, 동선을 미리 정리하면 설치일에 훨씬 편합니다.',
      category: 'TIP',
      writer: makeUser(2),
      author: makeUser(2),
      images: [],
      likeCount: 4,
      commentCount: 1,
      scrapCount: 2,
      liked: false,
      scraped: false,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  loungeComments: [
    {
      loungeCommentId: 1,
      commentId: 1,
      loungePostId: 1,
      parentCommentId: null,
      content: '좋은 정보 감사합니다.',
      writer: makeUser(3),
      author: makeUser(3),
      likeCount: 0,
      liked: false,
      replyCount: 0,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  displayReviews: [
    {
      displayReviewId: 1,
      reviewId: 1,
      displayId: 101,
      content: '작품과 동선이 잘 어울렸어요.',
      writer: makeUser(4),
      author: makeUser(4),
      likeCount: 2,
      liked: false,
      replyCount: 0,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  artworkFeelings: [
    {
      feelingId: 1,
      artworkId: 1001,
      content: '재료감이 인상적입니다.',
      writer: makeUser(5),
      author: makeUser(5),
      likeCount: 1,
      liked: false,
      replyCount: 0,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  artworkQuestions: [
    {
      questionId: 1,
      artworkId: 1001,
      content: '설치 위치는 어디인가요?',
      writer: makeUser(6),
      author: makeUser(6),
      answer: null,
      reply: null,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  personalArtworks: [
    {
      personalArtworkId: 1,
      artworkId: 1,
      title: '개인 작업 아카이브',
      artist: '디스플레이유',
      artistName: '디스플레이유',
      content: '개인 작업 mock 데이터입니다.',
      description: '개인 작업 mock 데이터입니다.',
      type: 'SCULPTURE',
      productionYear: 2026,
      materialMedia: 'Mixed media',
      material: 'Mixed media',
      size: '가변 설치',
      images: [{ imageId: 1, imageUrl: MOCK_UPLOAD_IMAGE_URL, width: 1280, height: 1600 }],
      liked: false,
      likeCount: 0,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  archivedExhibitionIds: new Set<number>(),
  archivedArtworkIds: new Set<number>(),
  archivedArtistIds: new Set<number>(),
};

export const listResponse = <TItem>(items: TItem[], size = items.length) => ({
  contents: items,
  content: items,
  items,
  exhibitions: items,
  artworks: items,
  artists: items,
  posts: items,
  reviews: items,
  comments: items,
  pageInfo: {
    nextCursorId: null,
    size,
    hasNext: false,
  },
  nextCursorId: null,
  size,
  hasNext: false,
});

export const okStatus = (id: number, active: boolean) => ({
  id,
  liked: active,
  isLiked: active,
  archived: active,
  isArchived: active,
  scraped: active,
  isScraped: active,
});
