import type {
  ArtworkDetail,
  ArtworkItem,
  ArtworkPreviewItem,
  DuPickItem,
  ExhibitionCardData,
  ExhibitionDetail,
  ExhibitionReviewDetail,
  ExhibitionReviewPost,
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
      '금요일은 전시 마감으로 16:00까지만 진행합니다.',
      '작품을 손으로 만지지 말아주세요.',
      '날짜별 운영 시간이 다를 수 있으니 방문 전 확인해주세요.',
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

export const EXHIBITION_REVIEW_POSTS: ExhibitionReviewPost[] = [
  {
    id: '1',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    description:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    commentCount: 8,
  },
  {
    id: '2',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    description:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    commentCount: 8,
    images: [
      'https://placehold.co/112x128',
      'https://placehold.co/112x128',
      'https://placehold.co/112x128',
    ],
  },
  {
    id: '3',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    description:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    commentCount: 8,
  },
  {
    id: '4',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    description:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    commentCount: 8,
  },
  {
    id: '5',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    description:
      '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    commentCount: 8,
  },
];

const REVIEW_DETAIL_CONTENT = [
  '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었어요.',
  '특히 빛과 그림자를 활용한 작품들이 정말 인상적이었고, 전시장 자체가 사진 찍기 좋게 구성되어 있어서 인증샷 남기기에도 좋더라구요.',
  '도슨트 시간에 맞춰서 갔는데 정말 잘한 선택이었어요. 작품만 봤을 때는 이해가 어려웠던 부분들이 설명을 듣고 나니 확 와닿더라구요.',
  '평일 오후에 방문했는데 사람도 많지 않아서 조용하게 관람할 수 있었어요. 전시 기간이 얼마 남지 않았으니 관심 있으신 분들은 서두르세요!',
];

const REVIEW_DETAIL_COMMENTS = [
  {
    id: '1',
    author: '미술애호가',
    time: '1시간 전',
    content: '저도 지난주에 다녀왔는데 정말 좋더라구요! 특히 2층 전시 공간이 인상적이었어요.',
    likeCount: 5,
    isLiked: false,
  },
  {
    id: '2',
    author: '미술애호가',
    time: '1시간 전',
    content: '저도 지난주에 다녀왔는데 정말 좋더라구요! 특히 2층 전시 공간이 인상적이었어요.',
    likeCount: 5,
    isLiked: false,
  },
  {
    id: '3',
    author: '미술애호가',
    time: '1시간 전',
    content: '저도 지난주에 다녀왔는데 정말 좋더라구요! 특히 2층 전시 공간이 인상적이었어요.',
    likeCount: 5,
    isLiked: false,
  },
  {
    id: '4',
    author: '미술애호가',
    time: '1시간 전',
    content: '저도 지난주에 다녀왔는데 정말 좋더라구요! 특히 2층 전시 공간이 인상적이었어요.',
    likeCount: 5,
    isLiked: false,
  },
];

export const EXHIBITION_REVIEW_DETAILS: Record<string, ExhibitionReviewDetail> = {
  '1': {
    id: '1',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: '달의작업실',
    date: '2026.05.24',
    content: REVIEW_DETAIL_CONTENT,
    likeCount: 24,
    isLiked: false,
    isSaved: false,
    comments: REVIEW_DETAIL_COMMENTS,
  },
  '2': {
    id: '2',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: '달의작업실',
    date: '2026.05.24',
    content: REVIEW_DETAIL_CONTENT,
    likeCount: 24,
    isLiked: false,
    isSaved: false,
    images: [
      'https://placehold.co/214x139',
      'https://placehold.co/218x137',
      'https://placehold.co/218x137',
    ],
    comments: REVIEW_DETAIL_COMMENTS,
  },
  '3': {
    id: '3',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: '달의작업실',
    date: '2026.05.24',
    content: REVIEW_DETAIL_CONTENT,
    likeCount: 24,
    isLiked: false,
    isSaved: false,
    comments: REVIEW_DETAIL_COMMENTS,
  },
  '4': {
    id: '4',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: '달의작업실',
    date: '2026.05.24',
    content: REVIEW_DETAIL_CONTENT,
    likeCount: 24,
    isLiked: false,
    isSaved: false,
    comments: REVIEW_DETAIL_COMMENTS,
  },
  '5': {
    id: '5',
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    author: '달의작업실',
    date: '2026.05.24',
    content: REVIEW_DETAIL_CONTENT,
    likeCount: 24,
    isLiked: false,
    isSaved: false,
    comments: REVIEW_DETAIL_COMMENTS,
  },
};

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

// ─── 작품 상세 데이터 ────────────────────────────────────────────────────────

export const ARTWORK_DETAILS: Record<string, ArtworkDetail> = {
  '1': {
    artworkId: 1,
    artworkName: '머문 자리의 온기',
    type: '회화',
    content:
      '색과 형태는 우리가 마주하는 순간들을 시각적으로 기록합니다. 이번 전시는 중앙학교 OO학과 구성원들이 각자의 시선으로 바라본 세계를 색채와 형태로 담아낸 작품들로 이루어져 있습니다. 서로 다른 배경과 경험을 지닌 작가의 시각에서 바라본 작품들이 전시됩니다...',
    productionYear: 2026,
    materialMedia: '아크릴, 캔버스',
    size: '90 × 120 cm',
    point:
      '이 작품은 사람들 틈에서 사람들이 놀던 인류와 무위기 에 집중해 감상하면 좋습니다. 빛을 내뿜는 생동감 넘는 색들과, 화려 하면서도 그 속에 여역을 활용합니다.',
    images: [
      { imageUrl: 'https://picsum.photos/seed/aw1/400/500', isThumbnail: true, sortOrder: 1 },
      { imageUrl: 'https://picsum.photos/seed/proc1/200/160', isThumbnail: false, sortOrder: 2 },
      { imageUrl: 'https://picsum.photos/seed/proc2/200/160', isThumbnail: false, sortOrder: 3 },
      { imageUrl: 'https://picsum.photos/seed/proc3/200/160', isThumbnail: false, sortOrder: 4 },
    ],
    artist: '이정우',
    exhibitionId: '1',
    exhibitionTitle: '색과 형태, 우리가 마주한 순간들',
    exhibitionOrganizer: '중앙대학교 OO동아리 이름 전시',
    exhibitionPeriod: '2026.05.23 – 05.30',
    exhibitionThumbnail: 'https://picsum.photos/seed/ex1/80/60',
    bookmarkCount: 204,
    isBookmarked: false,
  },
  '2': {
    artworkId: 2,
    artworkName: '경계의 흔적',
    type: '회화',
    content:
      '경계의 흔적은 우리가 일상에서 마주하는 경계들을 시각적으로 표현한 작품입니다. 보이지 않는 경계선들이 우리의 삶을 어떻게 구분하는지를 탐구합니다.',
    productionYear: 2026,
    materialMedia: '캔버스에 아크릴',
    size: '80 × 100 cm',
    point: '경계라는 개념에 주목하며 감상하시면 더 깊은 의미를 발견하실 수 있습니다.',
    images: [
      { imageUrl: 'https://picsum.photos/seed/aw2/400/500', isThumbnail: true, sortOrder: 1 },
      { imageUrl: 'https://picsum.photos/seed/proc4/200/160', isThumbnail: false, sortOrder: 2 },
      { imageUrl: 'https://picsum.photos/seed/proc5/200/160', isThumbnail: false, sortOrder: 3 },
    ],
    artist: '김민서',
    exhibitionId: '1',
    exhibitionTitle: '색과 형태, 우리가 마주한 순간들',
    exhibitionOrganizer: '중앙대학교 OO동아리 이름 전시',
    exhibitionPeriod: '2026.05.23 – 05.30',
    exhibitionThumbnail: 'https://picsum.photos/seed/ex2/80/60',
    bookmarkCount: 89,
    isBookmarked: false,
  },
  '4': {
    artworkId: 4,
    artworkName: '정지된 순간',
    type: '회화',
    content:
      '정지된 순간은 시간이 멈춘 듯한 고요한 순간을 포착한 작품입니다. 움직임과 정지 사이의 경계를 탐구합니다.',
    productionYear: 2026,
    materialMedia: '캔버스에 유화',
    size: '100 × 120 cm',
    point: '작품 속 정적인 순간에 집중하며 감상해보세요.',
    images: [
      { imageUrl: 'https://picsum.photos/seed/aw4/400/500', isThumbnail: true, sortOrder: 1 },
      { imageUrl: 'https://picsum.photos/seed/proc6/200/160', isThumbnail: false, sortOrder: 2 },
      { imageUrl: 'https://picsum.photos/seed/proc7/200/160', isThumbnail: false, sortOrder: 3 },
    ],
    artist: '최승우',
    exhibitionId: '2',
    exhibitionTitle: 'VISUAL WAVE',
    exhibitionOrganizer: '홍익대학교 시각디자인학과 졸업전시',
    exhibitionPeriod: '2026.06.02 – 06.10',
    exhibitionThumbnail: 'https://picsum.photos/seed/vw1/80/60',
    bookmarkCount: 156,
    isBookmarked: false,
  },
  '6': {
    artworkId: 6,
    artworkName: '표면 아래',
    type: '조각',
    content:
      '표면 아래에 숨겨진 이야기들을 조각으로 표현한 작품입니다. 겉으로 보이는 것과 내면의 진실 사이를 탐구합니다.',
    productionYear: 2026,
    materialMedia: '조각',
    size: '50 × 70 × 30 cm',
    point: '작품을 360도 다양한 각도에서 감상해보시길 권합니다.',
    images: [
      { imageUrl: 'https://picsum.photos/seed/aw6/400/500', isThumbnail: true, sortOrder: 1 },
      { imageUrl: 'https://picsum.photos/seed/proc8/200/160', isThumbnail: false, sortOrder: 2 },
    ],
    artist: '한동현',
    exhibitionId: '3',
    exhibitionTitle: 'NEW OFFICE',
    exhibitionOrganizer: '홍익대학교 시각디자인학과 기획전시',
    exhibitionPeriod: '2026.06.02 – 06.10',
    exhibitionThumbnail: 'https://picsum.photos/seed/no1/80/60',
    bookmarkCount: 73,
    isBookmarked: false,
  },
};

// ─── 방명록 데이터 ───────────────────────────────────────────────────────────

export const GUESTBOOK_REVIEWS: Record<string, GuestbookReview[]> = {
  '1': [
    {
      feelingId: 1,
      user: { userId: 1, nickname: '달의작업실' },
      createdAt: '2026.05.24',
      content:
        '작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.',
      reply: null,
    },
    {
      feelingId: 2,
      user: { userId: 2, nickname: '달의작업실' },
      createdAt: '2026.05.24',
      content:
        '작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.',
      reply: null,
    },
    {
      feelingId: 3,
      user: { userId: 3, nickname: '달의작업실' },
      createdAt: '2026.05.24',
      content:
        '작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.작품들이 전시 주제와 잘 연결됩니다.전시 주제와 잘 연련',
      reply: null,
    },
  ],
};

export const GUESTBOOK_QUESTIONS: Record<string, GuestbookQuestion[]> = {
  '1': [
    {
      questionId: 1,
      isPublic: false,
      createdAt: '2026.05.24',
      user: { userId: 4, nickname: 'artseker_j' },
      content: '비공개 질문입니다.',
      reply: null,
    },
    {
      questionId: 2,
      isPublic: true,
      createdAt: '2026.05.24',
      user: { userId: 4, nickname: 'artseker_j' },
      content: '색을 다루는 방식이 어떻게 되나요?',
      reply: {
        content:
          '작품들이 전시 주제와 잘 연결되어 있어서 천천히 보게 되었어요. 특히 색을 다루는 방식이 인상 깊었습니다.작품들이 전시 주제와 잘 연결됩니다.전시 주제와 잘 연련',
        createdAt: '2026.05.25',
      },
    },
    {
      questionId: 3,
      isPublic: false,
      createdAt: '2026.05.24',
      user: { userId: 4, nickname: 'artseker_j' },
      content: '비공개 질문 2입니다.',
      reply: null,
    },
  ],
};
