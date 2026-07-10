import type {
  ArtworkItem,
  ArtworkPreviewItem,
  DuPickItem,
  ExhibitionCardData,
  ExhibitionDetail,
  LoungePost,
  ReviewItem,
} from '@/types/exhibition';

// ─── 전시 상세 데이터 ────────────────────────────────────────────────────────

export const EXHIBITION_DETAILS: Record<string, ExhibitionDetail> = {
  '1': {
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
  },
  '2': {
    id: '2',
    title: 'VISUAL WAVE',
    subtitle: '홍익대학교 시각디자인학과 졸업전시',
    organizer: '홍익대학교 시각디자인학과',
    period: '2026.06.02 – 06.10',
    hours: '10:00 – 18:00',
    location: '홍익대학교 현대미술관',
    bookmarkCount: 218,
    isBookmarked: false,
    heroImages: [
      'https://picsum.photos/seed/vw1/400/300',
      'https://picsum.photos/seed/vw2/400/300',
      'https://picsum.photos/seed/vw3/400/300',
    ],
    description:
      'VISUAL WAVE는 시각 언어의 파동이 세상을 어떻게 바꾸는지를 탐구하는 전시입니다. 홍익대학교 시각디자인학과 학생들이 디지털과 아날로그를 넘나들며 만들어낸 작품들이 한자리에 모였습니다.',
    contentImages: [
      'https://picsum.photos/seed/vwc1/400/300',
      'https://picsum.photos/seed/vwc2/400/300',
    ],
    notices: ['사진 촬영은 플래시 없이 가능합니다.', '음식물 반입이 금지됩니다.'],
    host: '홍익대학교 시각디자인학과 졸업준비위원회',
    sns: '@visualwave_2026 (인스타그램)',
  },
  '3': {
    id: '3',
    title: 'NEW OFFICE',
    subtitle: '홍익대학교 시각디자인학과 기획전시',
    organizer: '홍익대학교 시각디자인학과',
    period: '2026.06.02 – 06.10',
    hours: '11:00 – 19:00',
    location: '홍익대학교 현대미술관 2관',
    bookmarkCount: 132,
    isBookmarked: false,
    heroImages: [
      'https://picsum.photos/seed/no1/400/300',
      'https://picsum.photos/seed/no2/400/300',
    ],
    description:
      'NEW OFFICE는 미래의 일터와 창작 공간에 대한 질문을 던지는 전시입니다. 공간, 사람, 그리고 일의 의미를 재정의하는 작품들로 구성되어 있습니다.',
    contentImages: ['https://picsum.photos/seed/noc1/400/300'],
    notices: ['단체 관람은 사전 예약 필수입니다.'],
    host: '홍익대학교 시각디자인학과',
    sns: '@newoffice_exhibit (인스타그램)',
  },
};

// ─── 홈 카드 데이터 (id는 EXHIBITION_DETAILS와 일치) ────────────────────────

export const GRADUATION_EXHIBITIONS: ExhibitionCardData[] = [
  {
    id: '1',
    title: '색과 형태, 우리가 마주한 순간들',
    school: '중앙대학교 OO학과',
    period: '05.23 – 05.30',
    thumbnail: 'https://picsum.photos/seed/ex1/300/400',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    school: '홍익대학교 시각디자인',
    period: '06.02 – 06.10',
    thumbnail: 'https://picsum.photos/seed/vw1/300/400',
  },
  {
    id: '3',
    title: 'NEW OFFICE',
    school: '홍익대학교 시각디자인',
    period: '06.02 – 06.10',
    thumbnail: 'https://picsum.photos/seed/no1/300/400',
  },
];

export const DEADLINE_EXHIBITIONS: ExhibitionCardData[] = [
  {
    id: '1',
    title: '색과 형태, 우리가 마주한 순간들',
    school: '중앙대학교 OO학과',
    period: '05.23 – 05.30',
    thumbnail: 'https://picsum.photos/seed/ex2/300/400',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    school: '홍익대학교 시각디자인',
    period: '06.02 – 06.10',
    thumbnail: 'https://picsum.photos/seed/vw2/300/400',
  },
  {
    id: '3',
    title: 'NEW OFFICE',
    school: '홍익대학교 시각디자인',
    period: '06.02 – 06.10',
    thumbnail: 'https://picsum.photos/seed/no2/300/400',
  },
];

// ─── 홈 피드 데이터 ────────────────────────────────────────────────────────

export const DU_PICK_ITEMS: DuPickItem[] = [
  {
    id: '1',
    name: '색과 형태, 우리가 마주한 순간들',
    date: '2026.05.23 – 05.30',
    location: '중앙대학교 301관',
  },
  {
    id: '2',
    name: '빛과 그림자, 경계 위의 시간들',
    date: '2026.06.01 – 06.10',
    location: '홍익대학교 현대미술관',
  },
  {
    id: '3',
    name: '정지된 움직임, 그 사이의 공간',
    date: '2026.06.14 – 06.20',
    location: '서울대학교 미술관',
  },
  {
    id: '4',
    name: '기억의 층위, 쌓인 감각들',
    date: '2026.06.25 – 07.05',
    location: '국립현대미술관 서울',
  },
];

export const ARTWORK_ITEMS: ArtworkPreviewItem[] = [
  {
    id: '1',
    name: '머문 자리의 온기',
    date: '2026.05.23 – 05.30',
  },
  {
    id: '2',
    name: '머문 자리의 온기',
    date: '2026.05.23 – 05.30',
  },
  {
    id: '3',
    name: '머문 자리의 온기',
    date: '2026.05.23 – 05.30',
  },
];

export const LOUNGE_POSTS: LoungePost[] = [
  {
    id: '1',
    tag: '전시 후기',
    content: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: 'artseeker_j',
    time: '1시간 전',
    views: '댓글 8',
  },
  {
    id: '2',
    tag: '준비·작업 팁',
    content: '전시 카드 인쇄 어디서 맡기나요?',
    author: 'design_junho',
    time: '3시간 전',
    views: '댓글 14',
  },
  {
    id: '3',
    tag: '모집·협업',
    content: '사진 전시 함께 준비할 팀원 구해요',
    author: 'lens_mina',
    time: '어제',
    views: '댓글 6',
  },
];

// ─── 작품·후기 데이터 ────────────────────────────────────────────────────────

export const ARTWORKS: Record<string, ArtworkItem[]> = {
  '1': [
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
  ],
  '2': [
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
  ],
  '3': [
    {
      id: '6',
      title: '표면 아래',
      artist: '한동현',
      thumbnail: 'https://picsum.photos/seed/aw6/300/300',
      medium: '조각',
      year: '2026',
    },
  ],
};

export const REVIEWS: Record<string, ReviewItem[]> = {
  '1': [
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
  ],
  '2': [
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
  ],
  '3': [
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
  ],
};
