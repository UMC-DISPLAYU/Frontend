import type {
  LoungeCommentDto,
  LoungePostDetailDto,
  LoungePostSummaryDto,
  LoungeReplyDto,
} from '@/api/dto';
import { MOCK_LOUNGE_IMAGES, MOCK_PROFILE_IMAGES } from '@/mocks/data';

const writer = {
  userId: 501,
  nickname: 'MOCK_artseeker_j',
  profileImageUrl: MOCK_PROFILE_IMAGES[0].imageUrl,
};

const mockPostSeeds = [
  ['DISPLAY_REVIEW', 'review', 'MOCK 전시 후기: 밤의 회화실을 보고 왔어요', '어두운 벽면 위로 작은 조명이 작품의 표면을 천천히 드러내는 구성이 좋았습니다.', 8, 24],
  ['DISPLAY_REVIEW', 'review', 'MOCK 설치 전시 동선이 정말 좋았던 날', '관람자가 작품 사이를 돌아 나오는 흐름까지 전시의 일부처럼 느껴졌어요.', 4, 13],
  ['DISPLAY_REVIEW', 'review', 'MOCK 졸업전에서 발견한 조용한 장면들', '작품 설명이 과하지 않아서 재료와 색의 밀도를 오래 바라볼 수 있었습니다.', 11, 31],
  ['WORK_TIP', 'tips', 'MOCK 캡션 카드 종이 추천 부탁드려요', '무광에 손자국이 덜 남는 종이를 찾고 있는데 직접 써본 곳 있나요?', 14, 7],
  ['WORK_TIP', 'tips', 'MOCK 작품 운송할 때 포장 순서 정리', '아크릴 판과 캔버스 작업을 같이 옮길 때 도움이 됐던 방식 공유합니다.', 6, 18],
  ['WORK_TIP', 'tips', 'MOCK 전시 조명 테스트 체크리스트', '작품별 그림자와 반사 위치를 기록해두면 설치 당일 훨씬 덜 흔들렸어요.', 3, 15],
  ['COLLABORATION', 'collab', 'MOCK 사진 기록 도와줄 분 구합니다', '전시 설치 과정과 오프닝 스냅을 함께 기록해주실 분을 찾고 있어요.', 5, 21],
  ['COLLABORATION', 'collab', 'MOCK 사운드 작업자와 협업하고 싶어요', '짧은 영상 설치에 맞는 공간 사운드를 같이 만들 분을 찾습니다.', 2, 12],
  ['COLLABORATION', 'collab', 'MOCK 공동 전시 그래픽 디자이너 모집', '포스터와 리플렛 톤을 함께 잡아갈 분이면 좋겠습니다.', 9, 19],
  ['VENUE_RENTAL', 'venue', 'MOCK 작은 드로잉 전시에 맞는 공간 있을까요', '15점 정도 걸 수 있고 자연광이 조금 들어오는 공간을 찾고 있습니다.', 12, 16],
  ['VENUE_RENTAL', 'venue', 'MOCK 홍대 근처 단기 대관 후기 공유', '벽 상태와 조명 레일 위치가 생각보다 중요해서 사전 답사가 꼭 필요했어요.', 7, 22],
  ['VENUE_RENTAL', 'venue', 'MOCK 학교 밖 첫 전시 공간 고르는 기준', '대관료보다 작품 반입 동선과 운영 시간을 먼저 봐야겠더라구요.', 10, 27],
] as const;

export const mockLoungePosts: LoungePostSummaryDto[] = [
  ...mockPostSeeds.map(([category, imageKey, title, content, commentCount, likeCount], index) => {
    const categoryImages = MOCK_LOUNGE_IMAGES[imageKey];
    const postImageUrls =
      index % 3 === 1
        ? categoryImages.map((image) => image.imageUrl)
        : index % 3 === 2
          ? [categoryImages[0].imageUrl]
          : [];

    return {
      loungePostId: index + 1,
      category,
      title,
      content,
      postImageUrls,
      writer: {
        ...writer,
        userId: 501 + index,
        nickname: `MOCK_${imageKey}_writer_${index + 1}`,
        profileImageUrl: MOCK_PROFILE_IMAGES[index % MOCK_PROFILE_IMAGES.length].imageUrl,
      },
      createdAt: `2026-06-${String(10 + index).padStart(2, '0')}T10:00:00`,
      commentCount,
      likeCount,
      isLiked: index % 4 === 0,
      isMyPost: [1, 4, 7, 10].includes(index + 1),
    };
  }),
];

export const mockLoungePostDetails: Record<number, LoungePostDetailDto> = Object.fromEntries(
  mockLoungePosts.map((post) => [
    post.loungePostId,
    {
      loungePostId: post.loungePostId,
      title: post.title,
      postImageUrls: post.postImageUrls,
      content: post.content,
      category: post.category,
      postStatus: 'ACTIVE',
      writer: post.writer,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
      commentCount: post.commentCount,
      likeCount: post.likeCount,
      isLiked: post.isLiked,
      isScrapped: false,
      isMyPost: post.isMyPost,
    },
  ]),
);

const mockCommentContents = [
  'MOCK 댓글: 이 관점 너무 좋아요. 다음 전시 볼 때 참고해볼게요.',
  'MOCK 댓글: 설치 동선 이야기가 특히 공감됐습니다.',
  'MOCK 댓글: 혹시 평일 오후에도 사람이 많은 편이었나요?',
  'MOCK 댓글: 작품 캡션까지 자세히 봐야 더 재미있겠네요.',
  'MOCK 댓글: 사진으로만 봐도 공간 분위기가 잘 느껴져요.',
  'MOCK 댓글: 공유 감사합니다. 이번 주말 일정에 넣어둘게요.',
  'MOCK 댓글: 저도 비슷한 문제로 준비 중이라 도움이 됐어요.',
  'MOCK 댓글: 대관 정보는 미리 체크해야 할 게 많더라구요.',
  'MOCK 댓글: 협업 조건이 명확해서 지원하기 좋을 것 같아요.',
  'MOCK 댓글: 조명 테스트 체크리스트 더 자세히 알고 싶어요.',
  'MOCK 댓글: 운송 포장 방식은 저장해두고 다시 볼게요.',
  'MOCK 댓글: 전시 소개 문장이 좋아서 직접 가보고 싶어졌어요.',
] as const;

export const mockLoungeCommentsByPostId: Record<number, LoungeCommentDto[]> = Object.fromEntries(
  mockLoungePosts.map((post) => [
    post.loungePostId,
    Array.from({ length: post.commentCount }, (_, index) => ({
      loungeCommentId: post.loungePostId * 100 + index + 1,
      parentCommentId: null,
      content: mockCommentContents[(post.loungePostId + index) % mockCommentContents.length],
      commentStatus: 'ACTIVE',
      writer: {
        ...writer,
        userId: 600 + post.loungePostId * 10 + index,
        nickname: `MOCK_commenter_${post.loungePostId}_${index + 1}`,
      },
      createdAt: `2026-06-${String(10 + post.loungePostId).padStart(2, '0')}T${String(
        11 + (index % 8),
      ).padStart(2, '0')}:00:00`,
      updatedAt: `2026-06-${String(10 + post.loungePostId).padStart(2, '0')}T${String(
        11 + (index % 8),
      ).padStart(2, '0')}:00:00`,
      likeCount: (post.loungePostId + index) % 9,
      replyCount: index % 3 === 0 ? 1 : 0,
      isLiked: index % 4 === 0,
      isMyComment: index === 0 && post.isMyPost,
    })),
  ]),
);

export const mockLoungeComments = mockLoungeCommentsByPostId[1];

export const mockLoungeReplies: LoungeReplyDto[] = [
  {
    loungeCommentId: 21,
    parentCommentId: 11,
    content: '맞아요, 동선이 조용해서 오래 보기 좋았습니다.',
    commentStatus: 'ACTIVE',
    writer,
    createdAt: '2026-05-24T11:10:00',
    updatedAt: '2026-05-24T11:10:00',
    likeCount: 2,
    isLiked: false,
    isMyComment: false,
  },
];
