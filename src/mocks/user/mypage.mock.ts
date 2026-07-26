import ExhibitionIcon from '@/assets/exhibit.svg';
import AvatarImage from '@/assets/Icon (1).svg';
import SchoolIcon from '@/assets/image 3666.svg';
import FieldIcon from '@/assets/image 3673.svg';
import { MOCK_ARTWORK_FIXTURES, MOCK_DISPLAY_FIXTURES } from '@/mocks/data';
import type { ArtistProfile, ExhibitionItem, SavedArtworkItem } from '@/types/mypage';

export const ARTIST_PROFILE_PAGE_PROFILE: ArtistProfile = {
  name: '김지원 님',
  isVerified: true,
  avatar: AvatarImage,
  school: '중앙대학교',
  schoolIcon: SchoolIcon,
  field: '회화 · 일러스트',
  fieldIcon: FieldIcon,
  exhibit: '4',
  exhibitionIcon: ExhibitionIcon,
  bio: '빛과 색의 경계를 탐구하며, 일상에서 발견한 순간들을 작품으로 표현합니다.',
  portfolioUrl: 'portfolio.sangjun.com',
};

export const ARTIST_PROFILE_PAGE_EXHIBITIONS: ExhibitionItem[] = [
  {
    id: '1',
    status: '전시종료',
    title: MOCK_DISPLAY_FIXTURES[0].title,
    org: `${MOCK_DISPLAY_FIXTURES[0].organization} ${MOCK_DISPLAY_FIXTURES[0].department}`,
    period: '06.09 - 06.22',
    place: MOCK_DISPLAY_FIXTURES[0].placeName,
    thumbnail: MOCK_DISPLAY_FIXTURES[0].posterImages[0].imageUrl,
    memo: '',
  },
  {
    id: '2',
    status: '전시종료',
    title: MOCK_DISPLAY_FIXTURES[4].title,
    org: `${MOCK_DISPLAY_FIXTURES[4].organization} ${MOCK_DISPLAY_FIXTURES[4].department}`,
    period: '01.22 - 01.28',
    place: MOCK_DISPLAY_FIXTURES[4].placeName,
    thumbnail: MOCK_DISPLAY_FIXTURES[4].posterImages[0].imageUrl,
    memo: '작가 노트와 플로어 플랜을 다시 참고하고 싶은 전시.',
  },
  {
    id: '3',
    status: '전시종료',
    title: MOCK_DISPLAY_FIXTURES[2].title,
    org: `${MOCK_DISPLAY_FIXTURES[2].organization} ${MOCK_DISPLAY_FIXTURES[2].department}`,
    period: '03.24 - 03.29',
    place: MOCK_DISPLAY_FIXTURES[2].placeName,
    thumbnail: MOCK_DISPLAY_FIXTURES[2].posterImages[0].imageUrl,
  },
];

export const ARTIST_PROFILE_PAGE_ARTWORKS: SavedArtworkItem[] = [
  {
    id: '1',
    title: MOCK_ARTWORK_FIXTURES[0].title,
    artist: MOCK_ARTWORK_FIXTURES[0].artist,
    thumbnail: MOCK_ARTWORK_FIXTURES[0].images[0].imageUrl,
  },
  {
    id: '2',
    title: MOCK_ARTWORK_FIXTURES[1].title,
    artist: MOCK_ARTWORK_FIXTURES[1].artist,
    thumbnail: MOCK_ARTWORK_FIXTURES[1].images[0].imageUrl,
  },
  {
    id: '3',
    title: MOCK_ARTWORK_FIXTURES[4].title,
    artist: MOCK_ARTWORK_FIXTURES[4].artist,
    thumbnail: MOCK_ARTWORK_FIXTURES[4].images[0].imageUrl,
  },
  {
    id: '4',
    title: MOCK_ARTWORK_FIXTURES[15].title,
    artist: MOCK_ARTWORK_FIXTURES[15].artist,
    thumbnail: MOCK_ARTWORK_FIXTURES[15].images[0].imageUrl,
  },
];
