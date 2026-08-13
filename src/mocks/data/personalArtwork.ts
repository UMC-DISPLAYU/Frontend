import type {
  PersonalArtworkFeelingReplyDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkQuestionReplyResponseDataDto,
  PersonalArtworkQuestionResponseDataDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';

const PERSONAL_ARTWORK_IMAGE =
  'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b2a18c5e-c4f4-4ac0-97f6-c92e1c180bbe-001-708216567_18050927684772787_5559121224732491072_n.jpg';

const PERSONAL_ARTWORK_PROCESS_IMAGE =
  'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a9da1c8c-b2a6-4ab5-88f2-5e6f9dd21bfc-004-720509368_18052722032772787_2015293037282161472_n.jpg';

export const MOCK_PERSONAL_ARTWORKS: PersonalArtworkResponseDataDto[] = [
  {
    personalArtworkId: 1,
    userId: 1,
    artistName: '디스플레이유',
    artworkName: '개인 작업 아카이브',
    content: '개인 작업의 제작 과정과 결과물을 정리한 아카이브입니다.',
    type: 'SCULPTURE',
    productionYear: 2026,
    materialMedia: 'Mixed media',
    size: '가변 설치',
    point: '재료의 질감과 형태가 만들어내는 균형을 눈여겨봐 주세요.',
    createdAt: '2026-08-04T09:00:00.000Z',
    isLiked: false,
    likeCount: 3,
    images: [
      {
        imageId: 1,
        imageUrl: PERSONAL_ARTWORK_IMAGE,
        width: 1280,
        height: 1600,
        sortOrder: 1,
        isThumbnail: true,
        imageType: 'ARTWORK',
        caption: '',
      },
      {
        imageId: 2,
        imageUrl: PERSONAL_ARTWORK_PROCESS_IMAGE,
        width: 1280,
        height: 1600,
        sortOrder: 2,
        isThumbnail: false,
        imageType: 'PROCESS',
        caption: '',
      },
    ],
  },
];

export const MOCK_PERSONAL_ARTWORK_FEELINGS: PersonalArtworkFeelingResponseDataDto[] = [
  {
    personalFeelingId: 1,
    personalArtworkId: 1,
    user: { userId: 2, nickname: 'quietroom', profileImageUrl: null, isCreator: false },
    content: '재료가 겹치는 지점이 인상적이에요.',
    createdAt: '2026-08-04T10:00:00.000Z',
    images: [],
    isLiked: false,
    likeCount: 2,
    replyCount: 1,
  },
];

export const MOCK_PERSONAL_ARTWORK_FEELING_REPLIES: PersonalArtworkFeelingReplyDto[] = [
  {
    personalFeelingReplyId: 1,
    personalFeelingId: 1,
    user: { userId: 1, nickname: '디스플레이유', profileImageUrl: null, isCreator: true },
    content: '좋게 봐주셔서 감사합니다.',
    createdAt: '2026-08-04T10:10:00.000Z',
    isLiked: false,
    likeCount: 0,
  },
];

export const MOCK_PERSONAL_ARTWORK_QUESTIONS: PersonalArtworkQuestionResponseDataDto[] = [
  {
    personalQuestionId: 1,
    personalArtworkId: 1,
    user: { userId: 3, nickname: 'seoyeon_k', profileImageUrl: null, isCreator: false },
    content: '이 작업은 실내 전시를 기준으로 제작하셨나요?',
    isPublic: true,
    accessible: true,
    isMine: false,
    canReply: false,
    answerStatus: 'ANSWERED',
    createdAt: '2026-08-04T11:00:00.000Z',
    isLiked: false,
    likeCount: 1,
  },
  {
    personalQuestionId: 2,
    personalArtworkId: 1,
    user: { userId: 4, nickname: 'minseo_art', profileImageUrl: null, isCreator: false },
    content: '비공개 질문 권한 확인용입니다.',
    isPublic: false,
    accessible: false,
    isMine: false,
    canReply: false,
    answerStatus: 'WAITING',
    createdAt: '2026-08-04T11:30:00.000Z',
    isLiked: false,
    likeCount: 0,
  },
];

export const MOCK_PERSONAL_ARTWORK_QUESTION_REPLIES: PersonalArtworkQuestionReplyResponseDataDto[] =
  [
    {
      personalQuestionReplyId: 1,
      personalQuestionId: 1,
      userId: 1,
      nickname: '디스플레이유',
      isCreator: true,
      content: '실내와 야외 모두 가능하지만, 실내 조명을 기준으로 먼저 맞췄습니다.',
      createdAt: '2026-08-04T11:20:00.000Z',
      isLiked: false,
      likeCount: 0,
    },
  ];
