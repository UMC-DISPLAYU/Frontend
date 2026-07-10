import type { ArtworkItem, ExhibitionDetail, ReviewItem } from '@/types/detail';

export const EXHIBITION_DETAIL: ExhibitionDetail = {
  id: '1',
  title: '색과 형태, 우리가 마주한 순간들',
  subtitle: '중앙대학교 OO학과의 이름 전시',
  organizer: '중앙대학교 OO학과',
  period: '2026.05.23 – 05.30',
  hours: '10:00 – 18:00',
  location: '중앙대학교 301관',
  bookmarkCount: 354,
  isBookmarked: true,
  heroImages: [
    'https://picsum.photos/seed/ex1/400/300',
    'https://picsum.photos/seed/ex2/400/300',
    'https://picsum.photos/seed/ex3/400/300',
  ],
  description:
    '색과 형태는 우리가 마주하는 순간들을 시각적으로 기록합니다. 이번 전시는 중앙대학교 OO학과 구성원들이 각자의 시선으로 바라본 세계를 색채와 형태로 담아낸 작품들로 이루어져 있습니다. 서로 다른 배경과 경험을 지닌 작가들의 시각이 하나의 공간에서 만나 새로운 대화를 이루어냅니다.',
  contentImages: [
    'https://picsum.photos/seed/ct1/400/300',
    'https://picsum.photos/seed/ct2/400/300',
    'https://picsum.photos/seed/ct3/400/300',
  ],
  notices: [
    '관람료는 사전에 예약하시면 16:00까지만 입장이 가능합니다.',
    '전시품 손수건 임의로 접지하시면 안됩니다.',
    '날씨에 문제 발생 시 다른 다른 3 일정이 있으실 경우에는 확인해주세요.',
  ],
  host: '중앙대학교 OO동아리',
  sns: '@displayu_oo (인스타그램 DM)',
};

export const ARTWORKS: ArtworkItem[] = [
  {
    id: '1',
    title: '경계의 흔적',
    artist: '김민서',
    thumbnail: 'https://picsum.photos/seed/aw1/300/300',
    medium: '캔버스에 아크릴',
    year: '2026',
  },
  {
    id: '2',
    title: '도시의 리듬',
    artist: '이준혁',
    thumbnail: 'https://picsum.photos/seed/aw2/300/300',
    medium: '디지털 프린트',
    year: '2026',
  },
  {
    id: '3',
    title: '기억의 층위',
    artist: '박지은',
    thumbnail: 'https://picsum.photos/seed/aw3/300/300',
    medium: '혼합 재료',
    year: '2026',
  },
  {
    id: '4',
    title: '정지된 순간',
    artist: '최승우',
    thumbnail: 'https://picsum.photos/seed/aw4/300/300',
    medium: '캔버스에 유화',
    year: '2026',
  },
  {
    id: '5',
    title: '빛의 잔상',
    artist: '정예린',
    thumbnail: 'https://picsum.photos/seed/aw5/300/300',
    medium: '사진',
    year: '2026',
  },
  {
    id: '6',
    title: '표면 아래',
    artist: '한동현',
    thumbnail: 'https://picsum.photos/seed/aw6/300/300',
    medium: '조각',
    year: '2026',
  },
];

export const REVIEWS: ReviewItem[] = [
  {
    id: '1',
    author: 'artlover_j',
    avatarColor: '#6366f1',
    rating: 5,
    content:
      '작품 하나하나가 정말 완성도가 높았어요. 특히 김민서 작가의 경계의 흔적이 인상 깊었습니다. 공간 구성도 좋고 동선도 편했어요.',
    date: '2026.05.25',
    likes: 24,
    images: ['https://picsum.photos/seed/rv1/200/200', 'https://picsum.photos/seed/rv2/200/200'],
  },
  {
    id: '2',
    author: 'gallery_hopper',
    avatarColor: '#f59e0b',
    rating: 4,
    content:
      '다양한 매체를 활용한 작품들이 신선했어요. 졸업 전시 치고 퀄리티가 굉장히 높습니다. 디지털 작업들이 특히 눈에 띄었어요.',
    date: '2026.05.24',
    likes: 17,
  },
  {
    id: '3',
    author: 'design_watcher',
    avatarColor: '#10b981',
    rating: 5,
    content:
      '전시 공간이 넓고 쾌적해서 관람하기 좋았어요. 작품 설명도 잘 되어 있어서 미술 지식이 없어도 충분히 즐길 수 있었습니다.',
    date: '2026.05.24',
    likes: 9,
  },
];
