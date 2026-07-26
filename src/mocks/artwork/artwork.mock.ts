import type {
  ArtworkFeelingDto,
  ArtworkPreviewItemDto,
  ArtworkQuestionDto,
  GetArtworkDetailResponseDataDto,
  ImageResponseDto,
} from '@/api/dto';
import {
  MOCK_ARTWORK_FIXTURE_BY_ID,
  MOCK_ARTWORK_FIXTURES,
  MOCK_DISPLAY_FIXTURE_BY_ID,
  type MockArtworkFixture,
} from '@/mocks/data';

const toExhibitionInfo = (artwork: MockArtworkFixture) => {
  const display = MOCK_DISPLAY_FIXTURE_BY_ID[artwork.displayId];

  return {
    displayId: artwork.displayId,
    exhibitionTitle: display.title,
    exhibitionPeriod: `${display.startedAt} - ${display.endedAt}`,
    exhibitionLocation: display.placeName,
  };
};

const toImageResponse = (
  artwork: MockArtworkFixture,
  imageIndex: number,
  isThumbnail: boolean,
): ImageResponseDto => {
  const image = artwork.images[imageIndex];

  return {
    imageId: artwork.artworkId * 100 + imageIndex + 1,
    imageUrl: image.imageUrl,
    isThumbnail,
    imageType: 'ARTWORK',
    caption: artwork.title,
    width: image.width,
    height: image.height,
    sortOrder: imageIndex + 1,
  };
};

export const mockArtworkPreviewItems: ArtworkPreviewItemDto[] = MOCK_ARTWORK_FIXTURES.map(
  (artwork) => ({
    artworkId: artwork.artworkId,
    artworkName: artwork.title,
    artistName: artwork.artist,
    artworkImageUrl: artwork.images[0].imageUrl,
    imageWidth: artwork.images[0].width,
    imageHeight: artwork.images[0].height,
    exhibitionInfo: toExhibitionInfo(artwork),
  }),
);

export const getMockArtworkDetail = (
  artworkId: number,
): GetArtworkDetailResponseDataDto => {
  const artwork = MOCK_ARTWORK_FIXTURE_BY_ID[artworkId] ?? MOCK_ARTWORK_FIXTURES[0];

  return {
    artworkId: artwork.artworkId,
    artworkName: artwork.title,
    content: artwork.content,
    type: artwork.type,
    productionYear: artwork.productionYear,
    materialMedia: artwork.materialMedia,
    size: artwork.size,
    point: artwork.point,
    images: artwork.images.map((_, index) => toImageResponse(artwork, index, index === 0)),
    artistName: artwork.artist,
    artistUserId: 200 + artwork.artworkId,
    exhibitionInfo: toExhibitionInfo(artwork),
    likeCount: 24 + (artwork.artworkId % 20),
    isLiked: false,
    isSaved: false,
  };
};

export const mockArtworkDetail = getMockArtworkDetail(MOCK_ARTWORK_FIXTURES[0].artworkId);

export const mockArtworkFeelings: ArtworkFeelingDto[] = [
  {
    feelingId: 1,
    content: '이미지와 재료감이 실제 전시 데이터라 훨씬 잘 와닿아요.',
    createdAt: '2026-05-24T11:20:00',
    user: { userId: 301, nickname: 'artseeker_j' },
    replies: [
      {
        userId: 201,
        nickname: MOCK_ARTWORK_FIXTURES[0].artist,
        content: '감상해 주셔서 감사합니다.',
        createdAt: '2026-05-24T12:20:00',
        isCreator: true,
      },
    ],
  },
];

export const mockArtworkQuestions: ArtworkQuestionDto[] = [
  {
    questionId: 1,
    content: '작품의 주 재료가 궁금합니다.',
    isPublic: true,
    answerStatus: 'ANSWERED',
    createdAt: '2026-05-24T12:00:00',
    user: { userId: 302, nickname: 'viewer_mina' },
    reply: {
      creatorName: MOCK_ARTWORK_FIXTURES[0].artist,
      isCreator: true,
      content: '상세 재료는 전시 정보에 적힌 매체를 기준으로 정리했습니다.',
      createdAt: '2026-05-24T14:00:00',
    },
  },
];
