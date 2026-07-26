const imageModules = import.meta.glob<string>('./images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
});

export type MockImageAsset = {
  imageUrl: string;
  width: number;
  height: number;
};

const image = (path: string, width: number, height: number): MockImageAsset => {
  const imageUrl = imageModules[`./images/${path}`];

  if (!imageUrl) {
    throw new Error(`Mock image not found: ${path}`);
  }

  return {
    imageUrl,
    width,
    height,
  };
};

const portrait = (path: string) => image(path, 1200, 1600);
const poster = (path: string) => image(path, 1280, 1600);
const landscape = (path: string) => image(path, 1600, 1067);
const square = (path: string) => image(path, 1600, 1600);

export type MockDisplayFixture = {
  displayId: number;
  title: string;
  subtitle: string | null;
  content: string;
  organization: string;
  department: string;
  displayType: string;
  displayFields: string[];
  region: string;
  status: string;
  startedAt: string;
  endedAt: string;
  startTime: string;
  endTime: string;
  dayLeft: number;
  placeName: string;
  qnaAccount: string;
  note: string | null;
  posterImages: MockImageAsset[];
  contentCategories: {
    name: string;
    description: string | null;
    images: MockImageAsset[];
  }[];
};

export type MockArtworkFixture = {
  artworkId: number;
  displayId: number;
  title: string;
  artist: string;
  content: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size: string;
  point: string;
  images: MockImageAsset[];
  processImages?: MockImageAsset[];
};

export const MOCK_DISPLAY_FIXTURES: MockDisplayFixture[] = [
  {
    displayId: 101,
    title: '[Soft Landing]',
    subtitle: '2026 홍익대학교 조소과 제52회 야외조각전',
    content:
      'Soft Landing은 햇살 위로 살며시 착륙하는 순간을 이야기한다. 그것은 단번의 정착이 아니라, 유영의 시간을 지나며 저마다 머물 곳을 찾아가는 일이다. 낯선 공간에서 부유하던 형상들은 어느새 각자가 익숙한 지면을 골라 몸을 기댄다.',
    organization: '홍익대학교',
    department: '조소과',
    displayType: 'DEPARTMENTS',
    displayFields: ['SCULPTURE'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2026-06-09',
    endedAt: '2026-06-22',
    startTime: '00:00',
    endTime: '24:00',
    dayLeft: 0,
    placeName: '홍익대학교 서울캠퍼스 일대',
    qnaAccount: '@hongik_sculpture_official',
    note: '오프닝: 2026. 6. 9(Tue) 13:00 이천득관 5F',
    posterImages: [
      poster('display/soft-landing/posters/01.jpg'),
      poster('display/soft-landing/posters/02.jpg'),
      poster('display/soft-landing/posters/03.jpg'),
    ],
    contentCategories: [
      {
        name: '야외조각지도',
        description: '전시 위치와 동선을 안내하는 지도 이미지',
        images: [poster('display/soft-landing/content/map.jpg')],
      },
      {
        name: '인사말',
        description: '전시 소개와 참여 작가 안내 이미지',
        images: [
          portrait('display/soft-landing/content/greeting-01.jpg'),
          portrait('display/soft-landing/content/greeting-02.jpg'),
        ],
      },
      {
        name: '작가소개',
        description: '참여 작가 소개 이미지',
        images: [
          image('display/soft-landing/content/artist-intro-01.jpg', 900, 1600),
          image('display/soft-landing/content/artist-intro-02.jpg', 900, 1600),
          image('display/soft-landing/content/artist-intro-03.jpg', 900, 1600),
          image('display/soft-landing/content/artist-intro-04.jpg', 900, 1600),
        ],
      },
    ],
  },
  {
    displayId: 102,
    title: '물성매력',
    subtitle: '2025 중앙대학교 공예학과 졸업전시',
    content:
      '물성매력은 특정 대상에 경험 가능한 물성을 부여함으로써 손에 잡히는 매력을 지니게 하는 힘을 의미합니다. 금속, 섬유, 도자, 목공예가 지닌 촉감과 물성을 졸업 작품을 통해 전달합니다.',
    organization: '중앙대학교',
    department: '디자인학부 공예학과',
    displayType: 'GRADUATION',
    displayFields: ['CRAFTS'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2025-11-05',
    endedAt: '2025-11-10',
    startTime: '10:00',
    endTime: '18:00',
    dayLeft: 0,
    placeName: '동덕아트갤러리',
    qnaAccount: '@caucraft_66th',
    note: '11/5(수) 10:30~3:30 일반 관람 / 4:00~ 관람 통제',
    posterImages: [image('display/material-charm/posters/01.jpg', 1129, 1600)],
    contentCategories: [
      {
        name: '전시장 안내',
        description: '전시 공간과 안내 그래픽',
        images: [
          portrait('display/material-charm/content/venue-01.jpg'),
          portrait('display/material-charm/content/venue-02.jpg'),
          portrait('display/material-charm/content/venue-03.jpg'),
        ],
      },
      {
        name: '관람 동선 및 배치도',
        description: '관람 동선과 전시 배치도 안내',
        images: [
          portrait('display/material-charm/content/layout-01.jpg'),
          portrait('display/material-charm/content/layout-02.jpg'),
        ],
      },
      {
        name: '전시 이벤트',
        description: '전시 이벤트와 도록 안내',
        images: [
          portrait('display/material-charm/content/event-01.jpg'),
          portrait('display/material-charm/content/catalog-01.jpg'),
        ],
      },
    ],
  },
  {
    displayId: 103,
    title: '모래알 사진반 제 47회 신인전',
    subtitle: null,
    content:
      '서울대학교 사진 동아리 모래알의 54기 작가들이 처음으로 선보이는 신인전입니다. 사진을 배우고 익혀온 시간을 지나 각자의 시선으로 세상을 담아낸 작품들을 관람객 앞에 내놓는 자리입니다.',
    organization: '서울대학교 중앙동아리',
    department: '모래알 사진반 54기',
    displayType: 'OTHERS',
    displayFields: ['PHOTOGRAPHY'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2026-03-24',
    endedAt: '2026-03-29',
    startTime: '10:00',
    endTime: '18:00',
    dayLeft: 0,
    placeName: '서울대학교 인문소극장',
    qnaAccount: '@moreal.film',
    note: '3/29은 전시 마감으로 15:00까지만 운영합니다.',
    posterImages: [poster('display/moreal-newcomers/posters/01.jpg')],
    contentCategories: [
      {
        name: '비하인드',
        description: '신인전 준비 과정과 전시 현장 이미지',
        images: [
          landscape('display/moreal-newcomers/content/behind-01.jpg'),
          landscape('display/moreal-newcomers/content/behind-02.jpg'),
          landscape('display/moreal-newcomers/content/behind-03.jpg'),
          landscape('display/moreal-newcomers/content/behind-04.jpg'),
        ],
      },
    ],
  },
  {
    displayId: 104,
    title: 'PUSH PRESS PLAY (밀고, 밀고, 밀-기)',
    subtitle: '2025년 이화여자대학교 섬유예술전공 졸업전시',
    content:
      'PUSH, PRESS, PLAY는 밀다라는 동사를 세 가지 방향으로 확장해 바라본다. 각자가 밀어낸 자리에는 새로운 흔적의 형상이 남고, 그 흔적의 자리는 작품이 된다.',
    organization: '이화여대',
    department: '섬유예술전공',
    displayType: 'GRADUATION',
    displayFields: ['CRAFTS'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2025-11-25',
    endedAt: '2025-11-30',
    startTime: '10:00',
    endTime: '18:00',
    dayLeft: 0,
    placeName: '조형예술관 A동 아트갤러리, 이화아트센터',
    qnaAccount: '@2025ewhafiberart',
    note: null,
    posterImages: [
      square('display/push-press-play/posters/01.jpg'),
      square('display/push-press-play/posters/02.jpg'),
      square('display/push-press-play/posters/03.jpg'),
    ],
    contentCategories: [
      {
        name: '큐레이션',
        description: '전시 큐레이션과 대표 안내 이미지',
        images: [
          portrait('display/push-press-play/content/curation-01.jpg'),
          portrait('display/push-press-play/content/curation-02.jpg'),
          portrait('display/push-press-play/content/curation-03.jpg'),
        ],
      },
      {
        name: '오시는 길, 관람 안내',
        description: '관람 안내와 공간 위치 이미지',
        images: [
          portrait('display/push-press-play/content/directions-01.jpg'),
          portrait('display/push-press-play/content/directions-02.jpg'),
        ],
      },
    ],
  },
  {
    displayId: 105,
    title: '진진가가진가;짜',
    subtitle: '2026 홍익대학교 예술전시기획 소모임 시오:리 정기전',
    content:
      '진짜와 가짜는 사실 여부를 판단하는 일상적인 언어이자 인간이 끊임없이 참됨을 욕망해온 흔적이다. 전시는 진짜와 가짜 사이를 가로지르는 무의식적 믿음을 비판적으로 성찰한다.',
    organization: '홍익대학교',
    department: '예술전시기획 소모임 시오:리',
    displayType: 'SMALL_GROUP',
    displayFields: ['DESIGN', 'CRAFTS', 'SCULPTURE'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2026-01-22',
    endedAt: '2026-01-28',
    startTime: '10:00',
    endTime: '19:00',
    dayLeft: 0,
    placeName: '고갤러리',
    qnaAccount: '@shiori_hgart',
    note: '1월 28일은 오후 3시까지만 운영됩니다.',
    posterImages: [
      image('display/shiori-real-fake/posters/01.jpg', 1122, 1600),
      image('display/shiori-real-fake/posters/02.jpg', 1110, 1600),
      image('display/shiori-real-fake/posters/03.jpg', 1224, 1600),
    ],
    contentCategories: [
      {
        name: 'Bts',
        description: '전시 준비와 현장 비하인드 이미지',
        images: [
          landscape('display/shiori-real-fake/content/bts-01.jpg'),
          landscape('display/shiori-real-fake/content/bts-02.jpg'),
          landscape('display/shiori-real-fake/content/bts-03.jpg'),
          landscape('display/shiori-real-fake/content/bts-04.jpg'),
        ],
      },
      {
        name: "Artists' Notes",
        description: '작가 노트 대표 이미지',
        images: [
          landscape('display/shiori-real-fake/content/notes-01.jpg'),
          portrait('display/shiori-real-fake/content/notes-02.jpg'),
          portrait('display/shiori-real-fake/content/notes-03.jpg'),
          portrait('display/shiori-real-fake/content/notes-04.jpg'),
        ],
      },
      {
        name: 'Floor plan',
        description: '전시 플로어 플랜',
        images: [
          image('display/shiori-real-fake/content/floor-plan-01.jpg', 1600, 1367),
          image('display/shiori-real-fake/content/floor-plan-02.jpg', 1600, 1281),
        ],
      },
    ],
  },
  {
    displayId: 106,
    title: '디디다 - DDDA',
    subtitle: '2026 국민대학교 입체미술전공 야외조각전',
    content: '국민대학교 입체미술전공의 야외조각전입니다.',
    organization: '국민대학교',
    department: '입체미술전공',
    displayType: 'DEPARTMENTS',
    displayFields: ['CRAFTS', 'SCULPTURE'],
    region: 'SEOUL',
    status: 'ENDED',
    startedAt: '2026-06-02',
    endedAt: '2026-06-23',
    startTime: '09:00',
    endTime: '17:00',
    dayLeft: 0,
    placeName: '국민대학교 예술관 앞',
    qnaAccount: '@kmu_sculpture_2026',
    note: null,
    posterImages: [square('display/ddda/posters/01.jpg')],
    contentCategories: [],
  },
];

const artwork = (
  displayId: number,
  artworkId: number,
  title: string,
  artist: string,
  type: string,
  materialMedia: string,
  images: MockImageAsset[],
  processImages: MockImageAsset[] = [],
): MockArtworkFixture => ({
  artworkId,
  displayId,
  title,
  artist,
  content: `${artist}의 작품 <${title}>입니다.`,
  type,
  productionYear: displayId === 102 || displayId === 104 ? 2025 : 2026,
  materialMedia,
  size: '가변 설치',
  point: '실제 테스트 데이터 이미지로 구성된 mock 작품입니다.',
  images,
  processImages,
});

export const MOCK_ARTWORK_FIXTURES: MockArtworkFixture[] = [
  artwork(101, 1001, 'E202 번아웃 사건', '김경준', 'SCULPTURE', 'PETG, 3D Modeling', [
    portrait('artwork/soft-landing/e202-burnout-01.jpg'),
    portrait('artwork/soft-landing/e202-burnout-02.jpg'),
  ]),
  artwork(101, 1002, '보를 찾습니다', '황다겸', 'SCULPTURE', 'PETG, 3D Modeling', [
    portrait('artwork/soft-landing/bo-01.jpg'),
    portrait('artwork/soft-landing/bo-02.jpg'),
  ], [portrait('artwork/soft-landing/bo-process-01.jpg')]),
  artwork(101, 1003, 'In loving memory of Waehring', '임유빈', 'SCULPTURE', '빈티지 피아노, 나무 파레트', [
    portrait('artwork/soft-landing/wahring-01.jpg'),
    portrait('artwork/soft-landing/wahring-02.jpg'),
  ], [portrait('artwork/soft-landing/wahring-process-01.jpg')]),
  artwork(101, 1004, '메두사호의 가장 높은 곳에서', '배건이', 'SCULPTURE', '혼합 매체', [
    portrait('artwork/soft-landing/medusa-01.jpg'),
    portrait('artwork/soft-landing/medusa-02.jpg'),
  ], [portrait('artwork/soft-landing/medusa-process-01.jpg')]),
  artwork(102, 2001, 'Chimera', '서정우', 'CRAFTS', 'Wood, Metal', [
    portrait('artwork/material-charm/chimera.jpg'),
  ]),
  artwork(102, 2002, 'Niki', '서정우', 'CRAFTS', 'Metal', [
    portrait('artwork/material-charm/niki.jpg'),
  ]),
  artwork(102, 2003, 'Corpus Ambigumm', '서정우', 'CRAFTS', 'Wood, Metal', [
    portrait('artwork/material-charm/corpus-ambigumm.jpg'),
  ]),
  artwork(102, 2004, 'Love Chaos', '최예진', 'FASHION', 'Fabric', [
    portrait('artwork/material-charm/love-chaos.jpg'),
  ], [portrait('artwork/material-charm/love-chaos-process-01.jpg')]),
  artwork(102, 2005, 'Void', '최예진', 'CRAFTS', 'Metal', [
    portrait('artwork/material-charm/void.jpg'),
  ]),
  artwork(102, 2006, 'Waves', '최예진', 'CRAFTS', 'Metal', [
    portrait('artwork/material-charm/waves.jpg'),
  ]),
  artwork(102, 2007, 'Spiral whif', '최예진', 'CRAFTS', 'Metal', [
    portrait('artwork/material-charm/spiral-whif.jpg'),
  ]),
  artwork(102, 2008, '#.1 산류천석', '김진아', 'CRAFTS', 'Ceramic', [
    portrait('artwork/material-charm/sanryucheonseok.jpg'),
  ]),
  artwork(102, 2009, '#.2 해타', '김진아', 'CRAFTS', 'Ceramic', [
    portrait('artwork/material-charm/haeta.jpg'),
  ]),
  artwork(102, 2010, '연피색', '김진아', 'CRAFTS', 'Wood', [
    portrait('artwork/material-charm/yeonpisaek.jpg'),
  ]),
  artwork(102, 2011, 'Cobblestone', '김진아', 'CRAFTS', 'Wood', [
    portrait('artwork/material-charm/cobblestone.jpg'),
  ]),
  artwork(103, 3001, 'King James', '임현도', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/king-james.jpg'),
  ]),
  artwork(103, 3002, '자전거도둑', '안인재', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/bicycle-thief.jpg'),
  ]),
  artwork(103, 3003, '흠신', '최희건', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/yawn.jpg'),
  ]),
  artwork(103, 3004, '비포섬라이즈', '김완승', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/before-sunrise.jpg'),
  ]),
  artwork(103, 3005, '사랑, 그 놈', '김지민', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/love-that-guy.jpg'),
  ]),
  artwork(103, 3006, '웃어, 윤', '우윤서', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/smile-yoon.jpg'),
  ]),
  artwork(103, 3007, '너는 나 나는 너', '정람아', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/you-and-me.jpg'),
  ]),
  artwork(103, 3008, '가출', '서민현', 'PHOTOGRAPHY', 'Photography', [
    landscape('artwork/moreal-newcomers/runaway.jpg'),
  ]),
  artwork(103, 3009, '데모데이', '이철승', 'PHOTOGRAPHY', 'Photography', [
    portrait('artwork/moreal-newcomers/demo-day.jpg'),
  ]),
  artwork(103, 3010, '여름 친구', '김빈수', 'PHOTOGRAPHY', 'Photography', [
    landscape('artwork/moreal-newcomers/summer-friend.jpg'),
  ]),
  artwork(103, 3011, '망할, 프레임', '최성유', 'PHOTOGRAPHY', 'Photography', [
    landscape('artwork/moreal-newcomers/damn-frame.jpg'),
  ]),
  artwork(103, 3012, 'Pacific Marine', '고준상', 'PHOTOGRAPHY', 'Photography', [
    landscape('artwork/moreal-newcomers/pacific-marine.jpg'),
  ]),
  artwork(104, 4001, '낙원을 찾아서', '강시진', 'CRAFTS', 'Fiber art', [
    landscape('artwork/push-press-play/paradise-01.jpg'),
    portrait('artwork/push-press-play/paradise-02.jpg'),
  ]),
  artwork(104, 4002, '삼족', '강진구', 'CRAFTS', 'Fiber art', [
    portrait('artwork/push-press-play/samjok-01.jpg'),
    portrait('artwork/push-press-play/samjok-02.jpg'),
  ]),
  artwork(104, 4003, '함', '강진구', 'CRAFTS', 'Fiber art', [
    portrait('artwork/push-press-play/ham-01.jpg'),
    portrait('artwork/push-press-play/ham-02.jpg'),
  ]),
  artwork(104, 4004, '201시간 36분동안 멍때리기', '고은아', 'CRAFTS', 'Fiber art', [
    portrait('artwork/push-press-play/201-hours-01.jpg'),
    portrait('artwork/push-press-play/201-hours-02.jpg'),
  ]),
  artwork(104, 4005, '공명, 2025', '고은아', 'CRAFTS', 'Fiber art', [
    portrait('artwork/push-press-play/gongmyeong-01.jpg'),
    portrait('artwork/push-press-play/gongmyeong-02.jpg'),
  ]),
  artwork(105, 5001, 'Legs of Reason', '이가은', 'SCULPTURE', 'Mixed media', [
    landscape('artwork/shiori-real-fake/legs-of-reason-01.jpg'),
    landscape('artwork/shiori-real-fake/legs-of-reason-02.jpg'),
  ]),
  artwork(105, 5002, 'Virtual landscape', '김민주', 'DESIGN', 'Mixed media', [
    landscape('artwork/shiori-real-fake/virtual-landscape-01.jpg'),
    landscape('artwork/shiori-real-fake/virtual-landscape-02.jpg'),
  ]),
  artwork(105, 5003, 'Everybody wants to rule the world', '김민정', 'SCULPTURE', 'Mixed media', [
    portrait('artwork/shiori-real-fake/everybody-wants-01.jpg'),
    landscape('artwork/shiori-real-fake/everybody-wants-02.jpg'),
  ]),
  artwork(105, 5004, '성 필립보 네리 축일의 고유 성무', '한은경', 'CRAFTS', 'Mixed media', [
    portrait('artwork/shiori-real-fake/saint-philip-01.jpg'),
    landscape('artwork/shiori-real-fake/saint-philip-02.jpg'),
  ]),
  artwork(105, 5005, 'Joker', '이정현', 'SCULPTURE', 'Mixed media', [
    portrait('artwork/shiori-real-fake/joker-01.jpg'),
    landscape('artwork/shiori-real-fake/joker-02.jpg'),
  ]),
  artwork(105, 5006, 'transparent wc', '안정빈, 원다혜', 'DESIGN', 'Mixed media', [
    portrait('artwork/shiori-real-fake/transparent-wc-01.jpg'),
    landscape('artwork/shiori-real-fake/transparent-wc-02.jpg'),
  ]),
  artwork(105, 5007, 'K-Jordan River', '조연우', 'SCULPTURE', 'Mixed media', [
    landscape('artwork/shiori-real-fake/k-jordan-river-01.jpg'),
    portrait('artwork/shiori-real-fake/k-jordan-river-02.jpg'),
  ]),
  artwork(105, 5008, '합의', '정수아', 'DESIGN', 'Mixed media', [
    landscape('artwork/shiori-real-fake/agreement-01.jpg'),
    landscape('artwork/shiori-real-fake/agreement-02.jpg'),
  ]),
  artwork(105, 5009, 'me me', '차민사', 'DESIGN', 'Mixed media', [
    landscape('artwork/shiori-real-fake/me-me-01.jpg'),
    landscape('artwork/shiori-real-fake/me-me-02.jpg'),
  ]),
  artwork(105, 5010, '열', '김수현', 'SCULPTURE', 'Mixed media', [
    landscape('artwork/shiori-real-fake/heat-01.jpg'),
    portrait('artwork/shiori-real-fake/heat-02.jpg'),
  ]),
  artwork(105, 5011, '꿈이라고 불러도 좋은', '박서영', 'DESIGN', 'Mixed media', [
    image('artwork/shiori-real-fake/dream-01.jpg', 900, 1600),
    landscape('artwork/shiori-real-fake/dream-02.jpg'),
  ]),
  artwork(106, 6001, '정동자실체', '박희주', 'SCULPTURE', 'Mixed media', [
    portrait('artwork/ddda/jeongdongja.jpg'),
  ], [image('artwork/ddda/jeongdongja-process-01.jpg', 1281, 1600)]),
  artwork(106, 6002, '물때', '전주현', 'SCULPTURE', 'Mixed media', [
    portrait('artwork/ddda/tide-01.jpg'),
    portrait('artwork/ddda/tide-02.jpg'),
  ]),
  artwork(106, 6003, '허무가 차오르는 정오에는 여기서 만나기로 해', '채시원', 'SCULPTURE', 'Mixed media', [
    portrait('artwork/ddda/noon.jpg'),
  ], [image('artwork/ddda/noon-process-01.jpg', 1280, 1600)]),
  artwork(106, 6004, 'Liquid Cat', '정민선', 'SCULPTURE', 'Mixed media', [
    square('artwork/ddda/liquid-cat-01.jpg'),
    portrait('artwork/ddda/liquid-cat-02.jpg'),
  ]),
  artwork(106, 6005, 'Neoteny', '전희원', 'SCULPTURE', 'Mixed media', [
    square('artwork/ddda/neoteny-01.jpg'),
    portrait('artwork/ddda/neoteny-02.jpg'),
  ]),
];

export const MOCK_DISPLAY_FIXTURE_BY_ID = MOCK_DISPLAY_FIXTURES.reduce<
  Record<number, MockDisplayFixture>
>((fixtures, fixture) => {
  fixtures[fixture.displayId] = fixture;
  return fixtures;
}, {});

export const MOCK_ARTWORKS_BY_DISPLAY_ID = MOCK_ARTWORK_FIXTURES.reduce<
  Record<number, MockArtworkFixture[]>
>((fixtures, fixture) => {
  fixtures[fixture.displayId] ??= [];
  fixtures[fixture.displayId].push(fixture);
  return fixtures;
}, {});

export const MOCK_ARTWORK_FIXTURE_BY_ID = MOCK_ARTWORK_FIXTURES.reduce<
  Record<number, MockArtworkFixture>
>((fixtures, fixture) => {
  fixtures[fixture.artworkId] = fixture;
  return fixtures;
}, {});

export const MOCK_PROFILE_IMAGES = [
  image('user/profiles/artist-01.jpg', 900, 1600),
  image('user/profiles/artist-02.jpg', 900, 1600),
  image('user/profiles/artist-03.jpg', 900, 1600),
  image('user/profiles/artist-04.jpg', 900, 1600),
];

export const MOCK_LOUNGE_IMAGES = {
  review: [
    landscape('lounge/posts/review-01.jpg'),
    landscape('lounge/posts/review-02.jpg'),
  ],
  tips: [
    landscape('lounge/posts/tip-01.jpg'),
    landscape('lounge/posts/tip-02.jpg'),
  ],
  collab: [
    portrait('lounge/posts/collab-01.jpg'),
    landscape('lounge/posts/collab-02.jpg'),
  ],
  venue: [
    portrait('lounge/posts/venue-01.jpg'),
    portrait('lounge/posts/venue-02.jpg'),
  ],
} as const;

export const MOCK_UPLOAD_IMAGE_URL = MOCK_DISPLAY_FIXTURES[0].posterImages[0].imageUrl;
