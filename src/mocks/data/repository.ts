/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_ARTWORK, MOCK_DISPLAY } from '@/mocks/data';
import {
  MOCK_PERSONAL_ARTWORK_FEELING_REPLIES,
  MOCK_PERSONAL_ARTWORK_FEELINGS,
  MOCK_PERSONAL_ARTWORK_QUESTION_REPLIES,
  MOCK_PERSONAL_ARTWORK_QUESTIONS,
  MOCK_PERSONAL_ARTWORKS,
} from '@/mocks/data/personalArtwork';

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
  isVerified: true,
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
  schoolDepartmentName: [display.organization, display.department].filter(Boolean).join(' '),
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
  isArchived: false,
});

const displayToDetail = (display: (typeof MOCK_DISPLAY_DETAILS)[number]) => ({
  ...displayToListItem(display),
  /*
   * MSW는 메모리에만 상태를 두기 때문에 새로고침하면 발급했던 토큰이 사라집니다.
   * 초대 링크를 새 탭에서 열어볼 수 있도록 전시마다 고정 토큰을 미리 심어둡니다.
   */
  invitationToken: `mock-invitation-${display.displayId}`,
  invitationDisabledAt: null,
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
      userId: 1,
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
  /* 작가 프로필 조회와 작가 저장에 쓰는 계정 id. 작품별로 고정된 값을 부여합니다. */
  artistUserId: 300 + (artwork.artworkId % 100),
  artworkImageUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  imageWidth: 1600,
  imageHeight: 1600,
  exhibitionInfo: (() => {
    const display = MOCK_DISPLAY_DETAILS.find((item) => item.displayId === artwork.displayId);
    const formatPeriod = (start?: string, end?: string) =>
      start && end ? `${start.split('-').join('.')} - ${end.split('-').join('.')}` : '';

    return {
      displayId: artwork.displayId,
      exhibitionTitle: display?.title ?? '',
      exhibitionSubtitle: display?.subtitle ?? '',
      exhibitionThumbnailUrl: display?.posterSection?.images?.[0]?.imageUrl ?? '',
      exhibitionOrganizer: display?.organization ?? '',
      exhibitionPeriod: formatPeriod(display?.startedAt, display?.endedAt),
      exhibitionLocation: display?.placeName ?? '',
    };
  })(),
  /* 원본 mock의 소개/감상 포인트가 비어 있어 화면 확인용 문구를 채웁니다. */
  content:
    artwork.description ??
    `${artwork.title}은(는) ${artwork.material ?? '다양한 재료'}로 작업한 ${artwork.productionYear ?? ''}년 작품입니다. 작가는 일상에서 마주친 장면을 다시 배치해 보는 사람마다 다른 이야기를 떠올리도록 했습니다.`,
  description: artwork.description,
  type: artwork.type,
  productionYear: artwork.productionYear,
  materialMedia: artwork.material,
  material: artwork.material,
  size: artwork.size,
  point: artwork.point ?? '재료의 질감과 형태가 만들어내는 균형을 눈여겨봐 주세요.',
  liked: false,
  /* 작품 상세 응답(ArtworkDetailResponse)이 내려주는 좋아요/저장 상태입니다. */
  isLiked: false,
  isArchived: false,
  likeCount: 3,
  thumbnailUrl: artwork.images[0]?.imageUrl ?? MOCK_UPLOAD_IMAGE_URL,
  /* 실제 API처럼 대표 이미지(ARTWORK, 첫 장이 썸네일)와 작업과정 이미지(WORK_PROCESS)를 한 배열에 담습니다. */
  images: [
    ...artwork.images.map((image: any, index: number) => ({
      imageId: artwork.artworkId * 100 + index + 1,
      artworkImageId: artwork.artworkId * 100 + index + 1,
      imageUrl: image.imageUrl,
      isThumbnail: index === 0,
      imageType: 'ARTWORK',
      width: 1600,
      height: 1600,
      sortOrder: index,
    })),
    ...(artwork.processImages ?? []).map((image: any, index: number) => ({
      imageId: artwork.artworkId * 1000 + index + 1,
      artworkImageId: artwork.artworkId * 1000 + index + 1,
      imageUrl: image.imageUrl,
      isThumbnail: false,
      imageType: 'WORK_PROCESS',
      width: 1600,
      height: 1600,
      sortOrder: index,
    })),
  ],
});

/*
 * 닉네임 검색(GET /users/search)과 팀원 초대 화면에서 사용하는 검색 대상 사용자입니다.
 * userId 1~15는 mockDb.me와 다른 핸들러(작품 질문 등)가 이미 쓰고 있어 201번대를 사용합니다.
 */
const MOCK_SEARCHABLE_USERS = [
  { userId: 201, name: '이정우', nickname: 'quietroom' },
  { userId: 202, name: '최유성', nickname: 'quietstudio' },
  { userId: 203, name: '김서연', nickname: 'seoyeon_k' },
  { userId: 204, name: '박지훈', nickname: 'jihoon_park' },
  { userId: 205, name: '한도윤', nickname: 'doyoon' },
  { userId: 206, name: '정민서', nickname: 'minseo_art' },
  { userId: 207, name: '오세훈', nickname: 'sehun_q' },
  { userId: 208, name: '강하늘', nickname: 'skyline' },
  { userId: 209, name: '윤채린', nickname: 'chaerin_j' },
  { userId: 210, name: '임규리', nickname: 'quriosity' },
];

export const mockDb: {
  [key: string]: any;
} = {
  me: makeUser(),
  searchableUsers: MOCK_SEARCHABLE_USERS,
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
      /* 후기 조회 응답(DisplayReviewResponse)은 작성자를 user로 내려줍니다. */
      user: makeUser(4),
      images: [],
      likeCount: 2,
      liked: false,
      replyCount: 0,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  displayReviewReplies: [] as any[],
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
  /* 저장한 작가 id 목록. 기본으로 한 명 저장된 상태입니다. */
  savedArtistIds: [1] as number[],
  artworkFeelingReplies: [] as any[],
  artworkQuestionReplies: [] as any[],
  artworkQuestions: [
    {
      questionId: 1,
      artworkId: 1001,
      content: '설치 위치는 어디인가요?',
      isPublic: true,
      accessible: true,
      canReply: false,
      likeCount: 0,
      writer: makeUser(6),
      author: makeUser(6),
      answer: null,
      reply: null,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  personalArtworks: [...MOCK_PERSONAL_ARTWORKS],
  personalArtworkFeelings: [...MOCK_PERSONAL_ARTWORK_FEELINGS],
  personalArtworkFeelingReplies: [...MOCK_PERSONAL_ARTWORK_FEELING_REPLIES],
  personalArtworkQuestions: [...MOCK_PERSONAL_ARTWORK_QUESTIONS],
  personalArtworkQuestionReplies: [...MOCK_PERSONAL_ARTWORK_QUESTION_REPLIES],
  archivedExhibitionIds: new Set<number>(),
  archivedArtworkIds: new Set<number>(),
  archivedPersonalArtworkIds: new Set<number>(),
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
