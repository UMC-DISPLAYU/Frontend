import type {
  PersonalArtworkFeelingReplyDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';
import { minutesAgo, MOCK_FEELING_PHOTO_URLS } from '@/mocks/data/feelings';

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

const personalFeelingImages = (count: number, offset = 0) =>
  MOCK_FEELING_PHOTO_URLS.slice(offset, offset + count).map((imageUrl, index) => ({
    imageId: 100 + offset + index,
    imageUrl,
    width: 1200,
    height: 1440,
    sortOrder: index + 1,
    isThumbnail: false,
    imageType: 'FEELING',
    caption: '',
  }));

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
  {
    personalFeelingId: 2,
    personalArtworkId: 1,
    user: { userId: 12, nickname: '산책하는사람', profileImageUrl: null, isCreator: false },
    content: '작업 과정까지 함께 보니 더 좋아요. 사진 몇 장 남겨요.',
    createdAt: minutesAgo(40),
    images: personalFeelingImages(3),
    isLiked: true,
    likeCount: 9,
    replyCount: 0,
  },
  {
    personalFeelingId: 3,
    personalArtworkId: 1,
    user: { userId: 13, nickname: 'seoyeon_k', profileImageUrl: null, isCreator: false },
    content:
      '결과물만 봤을 때와 제작 기록을 같이 봤을 때 인상이 많이 달라요.\n다음 작업도 기대하고 있을게요.',
    createdAt: minutesAgo(240),
    images: [],
    isLiked: false,
    likeCount: 4,
    replyCount: 0,
  },
  {
    personalFeelingId: 4,
    personalArtworkId: 1,
    user: { userId: 14, nickname: '전시메이트', profileImageUrl: null, isCreator: false },
    content: '',
    createdAt: minutesAgo(900),
    isDeleted: true,
    images: [],
    isLiked: false,
    likeCount: 0,
    replyCount: 1,
  },
  {
    personalFeelingId: 5,
    personalArtworkId: 1,
    user: { userId: 15, nickname: 'viewer_08', profileImageUrl: null, isCreator: false },
    content: '전시장에서 찍은 사진이에요.',
    createdAt: minutesAgo(2000),
    images: personalFeelingImages(5, 1),
    isLiked: false,
    likeCount: 1,
    replyCount: 0,
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
  {
    personalFeelingReplyId: 2,
    personalFeelingId: 4,
    user: { userId: 13, nickname: 'seoyeon_k', profileImageUrl: null, isCreator: false },
    content: '삭제된 글에 남아 있는 답글이에요.',
    createdAt: minutesAgo(800),
    isLiked: false,
    likeCount: 0,
  },
];
