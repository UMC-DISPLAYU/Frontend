import type {
  ArchivedArtistDto,
  ArchivedArtworkDto,
  ArchivedExhibitionDto,
} from '@/api/dto';
import {
  MOCK_ARTWORK_FIXTURES,
  MOCK_DISPLAY_FIXTURES,
  MOCK_PROFILE_IMAGES,
} from '@/mocks/data';

export type MockArchivedExhibition = ArchivedExhibitionDto & {
  title: string;
  organization: string;
  period: string;
  placeName: string;
  status: string;
  posterImageUrl: string;
};

export type MockArchivedArtwork = ArchivedArtworkDto & {
  artworkName: string;
  artistName: string;
  artworkImageUrl: string;
};

export type MockArchivedArtist = ArchivedArtistDto & {
  artistName: string;
  fields: string[];
  artworkCount: number;
  exhibitionCount: number;
  profileImageUrl: string;
};

export const mockArchivedExhibitions: MockArchivedExhibition[] = [
  {
    archiveDisplayId: 7001,
    displayId: MOCK_DISPLAY_FIXTURES[0].displayId,
    userId: 9001,
    memo: 'Soft Landing 야외 동선과 포스터 톤을 다시 참고하기 위해 저장.',
    savedAt: '2026-06-20T10:00:00',
    title: MOCK_DISPLAY_FIXTURES[0].title,
    organization: `${MOCK_DISPLAY_FIXTURES[0].organization} ${MOCK_DISPLAY_FIXTURES[0].department}`,
    period: '06.09 - 06.22',
    placeName: MOCK_DISPLAY_FIXTURES[0].placeName,
    status: '전시종료',
    posterImageUrl: MOCK_DISPLAY_FIXTURES[0].posterImages[0].imageUrl,
  },
  {
    archiveDisplayId: 7002,
    displayId: MOCK_DISPLAY_FIXTURES[4].displayId,
    userId: 9001,
    memo: null,
    savedAt: '2026-06-22T10:00:00',
    title: MOCK_DISPLAY_FIXTURES[4].title,
    organization: `${MOCK_DISPLAY_FIXTURES[4].organization} ${MOCK_DISPLAY_FIXTURES[4].department}`,
    period: '01.22 - 01.28',
    placeName: MOCK_DISPLAY_FIXTURES[4].placeName,
    status: '전시종료',
    posterImageUrl: MOCK_DISPLAY_FIXTURES[4].posterImages[0].imageUrl,
  },
];

export const mockArchivedArtworks: MockArchivedArtwork[] = [
  {
    archiveWorkId: 7101,
    artworkId: MOCK_ARTWORK_FIXTURES[0].artworkId,
    userId: 9001,
    memo: '야외 설치 스케일 참고용.',
    savedAt: '2026-06-20T10:00:00',
    artworkName: MOCK_ARTWORK_FIXTURES[0].title,
    artistName: MOCK_ARTWORK_FIXTURES[0].artist,
    artworkImageUrl: MOCK_ARTWORK_FIXTURES[0].images[0].imageUrl,
  },
  {
    archiveWorkId: 7102,
    artworkId: MOCK_ARTWORK_FIXTURES[4].artworkId,
    userId: 9001,
    memo: null,
    savedAt: '2026-06-21T10:00:00',
    artworkName: MOCK_ARTWORK_FIXTURES[4].title,
    artistName: MOCK_ARTWORK_FIXTURES[4].artist,
    artworkImageUrl: MOCK_ARTWORK_FIXTURES[4].images[0].imageUrl,
  },
  {
    archiveWorkId: 7103,
    artworkId: MOCK_ARTWORK_FIXTURES[15].artworkId,
    userId: 9001,
    memo: null,
    savedAt: '2026-06-22T10:00:00',
    artworkName: MOCK_ARTWORK_FIXTURES[15].title,
    artistName: MOCK_ARTWORK_FIXTURES[15].artist,
    artworkImageUrl: MOCK_ARTWORK_FIXTURES[15].images[0].imageUrl,
  },
];

export const mockArchivedArtists: MockArchivedArtist[] = [
  {
    archiveArtistId: 7201,
    artistId: 501,
    userId: 9001,
    savedAt: '2026-06-23T10:00:00',
    artistName: '박하린',
    fields: ['설치', '미디어'],
    artworkCount: 12,
    exhibitionCount: 4,
    profileImageUrl: MOCK_PROFILE_IMAGES[0].imageUrl,
  },
  {
    archiveArtistId: 7202,
    artistId: 502,
    userId: 9001,
    savedAt: '2026-06-24T10:00:00',
    artistName: '이도현',
    fields: ['사진', '영상'],
    artworkCount: 9,
    exhibitionCount: 3,
    profileImageUrl: MOCK_PROFILE_IMAGES[1].imageUrl,
  },
];
