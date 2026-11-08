import type { ArtworkFeelingDto, ArtworkGuestbookReplyDto } from '@/api/dto';
import { MOCK_ARTWORK } from '@/mocks/data/images';

export const MOCK_FEELING_PHOTO_URLS = [
  ...new Set(MOCK_ARTWORK.flatMap((artwork) => artwork.images.map((image) => image.imageUrl))),
].slice(0, 8);

export const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const feelingImages = (feelingId: number, count: number, offset = 0) =>
  MOCK_FEELING_PHOTO_URLS.slice(offset, offset + count).map((imageUrl, index) => ({
    feelingImageId: feelingId * 10 + index,
    imageUrl,
    width: 1200,
    height: 1440,
    sortOrder: index + 1,
  }));

const user = (userId: number, nickname: string, isCreator = false) => ({
  userId,
  nickname,
  isCreator,
  profileImageUrl: null,
});

const ARTIST = user(305, '김경준', true);
const LONG_TEXT =
  '작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.\n가까이에서 볼 때와 멀리서 볼 때 느낌이 완전히 달라서 두 번 돌아봤어요.';

export const MOCK_ARTWORK_FEELINGS: (ArtworkFeelingDto & { artworkId: number })[] = [
  {
    feelingId: 2,
    artworkId: 1001,
    content: '작품 앞에 오래 서 있게 되더라고요. 사진으로 다시 봐도 좋네요.',
    createdAt: minutesAgo(12),
    user: user(11, 'quietroom'),
    images: feelingImages(2, 3),
    likeCount: 12,
    isLiked: false,
    replyCount: 2,
  },
  {
    feelingId: 3,
    artworkId: 1001,
    content: LONG_TEXT,
    createdAt: minutesAgo(95),
    user: user(12, '산책하는사람'),
    images: [],
    likeCount: 7,
    isLiked: true,
    replyCount: 0,
  },
  {
    feelingId: 4,
    artworkId: 1001,
    content: '전시장에서 찍은 사진 여러 장 남겨요.',
    createdAt: minutesAgo(180),
    user: user(13, 'seoyeon_k'),
    images: feelingImages(4, 5, 1),
    likeCount: 3,
    isLiked: false,
    replyCount: 0,
  },
  {
    feelingId: 5,
    artworkId: 1001,
    content: '',
    createdAt: minutesAgo(300),
    isDeleted: true,
    user: user(14, '전시메이트'),
    images: [],
    likeCount: 0,
    isLiked: false,
    replyCount: 1,
  },
  {
    feelingId: 6,
    artworkId: 1001,
    content: '.',
    createdAt: minutesAgo(600),
    user: user(15, 'viewer_08'),
    images: feelingImages(6, 1, 2),
    likeCount: 1,
    isLiked: false,
    replyCount: 0,
  },
  {
    feelingId: 7,
    artworkId: 1001,
    content: '제가 남긴 방명록이에요. 다음 전시도 기대할게요.',
    createdAt: minutesAgo(1500),
    isMine: true,
    user: user(1, '디스플레이유'),
    images: [],
    likeCount: 0,
    isLiked: false,
    replyCount: 0,
  },
  {
    feelingId: 8,
    artworkId: 1001,
    content: '재료감이 인상적입니다.',
    createdAt: minutesAgo(3000),
    user: user(5, '아트러버'),
    images: [],
    likeCount: 1,
    isLiked: false,
    replyCount: 0,
  },
];

export const MOCK_ARTWORK_FEELING_REPLIES: (ArtworkGuestbookReplyDto & { feelingId: number })[] = [
  {
    feelingReplyId: 21,
    feelingId: 2,
    content: '오래 봐주셔서 감사합니다. 저도 그 자리에서 보는 걸 제일 좋아해요.',
    createdAt: minutesAgo(10),
    user: ARTIST,
    likeCount: 4,
    isLiked: false,
  },
  {
    feelingReplyId: 22,
    feelingId: 2,
    content: '저도 같은 자리에서 한참 있었어요.',
    createdAt: minutesAgo(8),
    user: user(12, '산책하는사람'),
    likeCount: 0,
    isLiked: false,
  },
  {
    feelingReplyId: 23,
    feelingId: 5,
    content: '삭제된 글에 남아 있는 답글이에요.',
    createdAt: minutesAgo(280),
    user: user(13, 'seoyeon_k'),
    likeCount: 0,
    isLiked: false,
  },
];
