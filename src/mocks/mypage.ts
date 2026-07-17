import type { ArtistItem, ExhibitionItem, SavedArtworkItem, TabKey } from '@/types/mypage';

export const TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

// 내가 북마크한 전시 (일반 사용자 뷰)
export const MY_BOOKMARKED_EXHIBITIONS: ExhibitionItem[] = [
  {
    id: '1',
    status: '전시 중',
    title: '형태의 침묵',
    org: '중앙대학교 디자인학부',
    period: '05.28 – 06.05',
    place: '중앙대학교 310관 갤러리',
    thumbnail: 'https://placehold.co/112x140',
    memo: '',
  },
  {
    id: '2',
    status: '전시 중',
    title: '형태의 침묵',
    org: '중앙대학교 디자인학부',
    period: '05.28 – 06.05',
    place: '중앙대학교 310관 갤러리',
    thumbnail: 'https://placehold.co/112x140',
    memo: '공간이 조용해서 작품의 재료감이 더 잘 보였다. 작품 설명보다 전시 동선...',
  },
  {
    id: '3',
    status: '전시종료',
    title: '감각의 표면',
    org: '홍익대학교 회화과',
    period: '06.23 – 06.27',
    place: '홍익대학교 현대미술관',
    thumbnail: 'https://placehold.co/112x140',
  },
];

// 내가 참여한 전시 (작가 뷰)
export const MY_PARTICIPATED_EXHIBITIONS: ExhibitionItem[] = [
  {
    id: '4',
    status: '전시 중',
    title: '빛과 색의 경계',
    org: '중앙대학교 예술대학',
    period: '07.10 – 07.20',
    place: '중앙대학교 아트센터',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '5',
    status: '전시예정',
    title: '일상의 순간들',
    org: '서울시립미술관',
    period: '08.01 – 08.15',
    place: '서울시립미술관 북서울관',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '6',
    status: '전시종료',
    title: '색채의 향연',
    org: '홍익대학교 미술대학',
    period: '06.01 – 06.10',
    place: '홍익대학교 미술관',
    thumbnail: 'https://placehold.co/112x140',
  },
];

// 하위 호환성을 위한 alias (기본은 북마크한 전시)
export const EXHIBITIONS = MY_BOOKMARKED_EXHIBITIONS;

// 내가 북마크한 작품 (일반 사용자 뷰)
export const MY_BOOKMARKED_ARTWORKS: SavedArtworkItem[] = [
  {
    id: '1',
    title: 'FROM 2026',
    artist: '고상준',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    artist: '최유성',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '3',
    title: 'FROM 2026',
    artist: '고상준',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '4',
    title: 'VISUAL WAVE',
    artist: '최유성',
    thumbnail: 'https://placehold.co/112x140',
  },
];

// 내가 등록한 작품 (작가 뷰)
export const MY_REGISTERED_ARTWORKS: SavedArtworkItem[] = [
  {
    id: '5',
    title: '빛의 파편',
    artist: '김지원',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '6',
    title: '색채의 울림',
    artist: '김지원',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '7',
    title: '순간의 기록',
    artist: '김지원',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '8',
    title: '경계의 풍경',
    artist: '김지원',
    thumbnail: 'https://placehold.co/112x140',
  },
];

// 하위 호환성을 위한 alias (기본은 북마크한 작품)
export const ARTWORKS = MY_BOOKMARKED_ARTWORKS;

export const ARTISTS: ArtistItem[] = [
  {
    id: '1',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '2',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
  {
    id: '3',
    name: '작가 닉네임',
    field: '분야',
    registeration: '3',
    exhibition: '8',
    thumbnail: 'https://placehold.co/112x140',
  },
];
