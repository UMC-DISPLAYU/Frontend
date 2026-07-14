import type {
  ArtistItem,
  SavedArtworkItem,
  ExhibitionItem,
  TabKey,
} from '@/types/mypage';

export const TABS: { key: TabKey; label: string }[] = [
  { key: 'exhibition', label: '전시' },
  { key: 'artwork', label: '작품' },
  { key: 'artist', label: '작가' },
];

export const EXHIBITIONS: ExhibitionItem[] = [
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

export const ARTWORKS: SavedArtworkItem[] = [
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
