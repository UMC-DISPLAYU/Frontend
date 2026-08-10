type MockImageAsset = {
  imageUrl: string;
};

type MockDisplayContentCategory = {
  name: string;
  description: string | null;
  images: MockImageAsset[];
};

type MockDisplay = {
  displayId: number;
  title: string;
  subtitle: string | null;
  content: string | null;
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
  contentCategories: Omit<MockDisplayContentCategory, 'images'>[];
  posterSection: {
    title: '전시 포스터';
    images: MockImageAsset[];
  };
  contentSection: {
    title: '전시 콘텐츠';
    categories: MockDisplayContentCategory[];
  };
};

type MockArtwork = {
  artworkId: number;
  displayId: number;
  title: string;
  artist: string;
  description: string | null;
  type: string;
  productionYear: number;
  material: string | null;
  size: string | null;
  point: string | null;
  images: MockImageAsset[];
  processImages?: MockImageAsset[];
};

export const MOCK_DISPLAY: MockDisplay[] = [
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
    contentCategories: [
      {
        name: '야외조각지도',
        description: '전시 위치와 동선을 안내하는 지도 이미지',
      },
      {
        name: '인사말',
        description: '전시 소개와 참여 작가 안내 이미지',
      },
      {
        name: '작가소개',
        description: '참여 작가 소개 이미지',
      },
    ],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b2a18c5e-c4f4-4ac0-97f6-c92e1c180bbe-001-708216567_18050927684772787_5559121224732491072_n.jpg',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8b3ff596-c2dc-4822-a13e-066db12a0d86-002-709024172_18050927162772787_598010767939924688_n.jpg',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b47d443a-91de-45c3-96d1-bfde8b1c91d1-003-708266326_18050927192772787_2155808958020455080_n.jpg',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [
        {
          name: '야외조각지도',
          description: '전시 위치와 동선을 안내하는 지도 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a9da1c8c-b2a6-4ab5-88f2-5e6f9dd21bfc-004-720509368_18052722032772787_2015293037282161472_n.jpg',
            },
          ],
        },
        {
          name: '인사말',
          description: '전시 소개와 참여 작가 안내 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/601d7835-3b61-4809-81f4-fe9bedb39ae6-005-719754943_18052814927772787_9067493792378604323_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ffcceaca-5ea9-48cc-bbc9-1f8ce386a745-006-720031448_18052814915772787_4738117976788337716_n.jpg',
            },
          ],
        },
        {
          name: '작가소개',
          description: '참여 작가 소개 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e0ffbada-aef6-4aea-b00e-f2d22e73bf70-007-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/142dad20-b509-495a-988d-5f738c557003-008-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/aaf090b2-2b20-43d2-93ab-cbea620b1b8e-009-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c2c1a1a8-5bc4-4e3b-9530-2e676eb29ef9-010-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/81057c73-13d8-4a22-b994-0070f4feccd6-011-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6e1afbe2-6d65-4231-82b7-c6478244ac93-012-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1f11e98c-37f2-4633-97c5-ceab943782eb-013-image.png',
            },
          ],
        },
      ],
    },
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
    contentCategories: [
      {
        name: '전시장 안내',
        description: '전시 공간과 안내 그래픽',
      },
      {
        name: '관람 동선 및 배치도',
        description: '관람 동선과 전시 배치도 안내',
      },
      {
        name: '전시 이벤트',
        description: '전시 이벤트 안내',
      },
      {
        name: '졸업전시 도록 & 모바일 초대장',
        description: '졸업전시 도록과 모바일 초대장 안내',
      },
    ],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d2100146-693f-4478-9db6-4550fd79f3eb-038-image.png',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [
        {
          name: '전시장 안내',
          description: '전시 공간과 안내 그래픽',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c8d67720-7a4f-4969-8275-08a116ad7d1c-039-566945723_18069331595587381_4567195238886012965_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/286cc8f7-8cfc-417d-a998-174b94ee7c1e-040-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4ec5f98e-b7d7-438a-826e-6a1448651e9c-041-image.png',
            },
          ],
        },
        {
          name: '관람 동선 및 배치도',
          description: '관람 동선과 전시 배치도 안내',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/577b6be9-b01d-4401-b642-81bb392f368a-042-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/56e7a0c7-de8e-43d6-bb34-96744da510fe-043-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/3d8686e3-2488-4f73-968d-9a541b586cac-044-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/48babef0-0bab-40c8-b93d-129d19af0c33-045-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/218bc6be-fe06-4f58-a25a-7f935fa1de80-046-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/740cc48c-dd2f-4e94-bc3d-c28c6b1642bf-047-image.png',
            },
          ],
        },
        {
          name: '전시 이벤트',
          description: '전시 이벤트 안내',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f9238a9d-3327-40fd-b2b1-443d1202395e-048-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5d786b3f-710a-42f8-be7e-5fdb73f25d84-049-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e51001af-2149-46e3-8a66-002d81721b01-050-image.png',
            },
          ],
        },
        {
          name: '졸업전시 도록 & 모바일 초대장',
          description: '졸업전시 도록과 모바일 초대장 안내',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f8df36e1-ad98-4ebb-b6b6-1ade5bd2cf6a-051-572728035_18071143889587381_6965526291716601587_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/03a616f5-26bb-4c4a-b066-0b3d422e1d09-052-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b3d91e6d-af29-471e-ae44-0064f4420bda-053-image.png',
            },
          ],
        },
      ],
    },
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
    contentCategories: [
      {
        name: '비하인드',
        description: '신인전 준비 과정과 전시 현장 이미지',
      },
    ],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/73aa5744-b838-43b7-9565-81ab748cd4c5-074-657367294_17940282966176040_755627290240899685_n.jpg',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [
        {
          name: '비하인드',
          description: '신인전 준비 과정과 전시 현장 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/aced4249-936e-46f5-a031-78a8bf42c995-075-660120338_17942677713176040_1398633902148556870_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ddc82791-4f0b-4788-8a57-6145483d1482-076-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8ee54237-c5e8-468d-94bb-097c7c78e00d-077-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4cee7481-d787-49b9-9f25-35e78723267c-078-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f9134d70-ab74-4c84-9301-8955ec43da77-079-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/aaa4515c-bac1-426b-8d7b-0e81c4d4886d-080-image.png',
            },
          ],
        },
      ],
    },
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
    contentCategories: [
      {
        name: '큐레이션',
        description: '전시 큐레이션과 대표 안내 이미지',
      },
      {
        name: '오시는 길, 관람 안내',
        description: '관람 안내와 공간 위치 이미지',
      },
    ],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e056344c-6ae3-49c2-8b1c-4e9d2b844747-093-573401871_17995983398841733_1085809086528104473_n.jpg',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5b3294ce-39c9-4171-a131-50d9fa1bd2ce-094-572105731_17995983371841733_2104135446232870472_n.jpg',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/338bad2e-c318-4fc6-9988-6cdfc9279716-095-573578760_17995983338841733_7309280684058239204_n.jpg',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [
        {
          name: '큐레이션',
          description: '전시 큐레이션과 대표 안내 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7d80f916-67cc-44f0-ade0-999ca781e3eb-096-588857498_17892419610386604_7715102003689827056_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8939af0b-4968-43e8-9f11-6f4303deaf32-097-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/007f7234-0d1b-46db-a653-a4ad54f5adfe-098-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/53acb9f2-440a-4ce0-be89-3a64a6a3e573-099-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/37823969-b862-42c7-b104-75e6de9c0bec-100-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/870f1544-5e43-45c7-8ee5-7948207b2b4c-101-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e79481f0-ff89-42ca-ad04-0606366cc5a0-102-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/48185980-0812-4ca4-8a88-c52162e09545-103-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f7bb4297-0d04-4cf4-9d3b-505e2b45dde3-104-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ce3cbfb0-d8cc-4ef5-bebb-66f927e8280d-105-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/821fc59b-8154-4b81-b6cb-93428895a504-106-image.png',
            },
          ],
        },
        {
          name: '오시는 길, 관람 안내',
          description: '관람 안내와 공간 위치 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f351f76b-1fce-47b0-be74-8bc649f6ebd9-107-584962573_17998057685841733_679761784975204005_n.jpg',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8c66528c-afd5-48ba-862b-e35a9a356470-108-587238260_17998057550841733_7224559591468310275_n.jpg',
            },
          ],
        },
      ],
    },
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
    contentCategories: [
      {
        name: 'Bts',
        description: '전시 준비와 현장 비하인드 이미지',
      },
      {
        name: "Artists' Notes",
        description: '작가 노트 대표 이미지',
      },
      {
        name: 'Floor plan',
        description: '전시 플로어 플랜',
      },
    ],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8bceb90b-d313-4dba-84b9-c9a5fc7764a8-119-616459963_18113585767619485_9020492571016948442_n.jpg',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a2bf3e01-40f0-4433-848d-4030583f4183-120-image.png',
        },
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4c5aab71-8fc5-4d4a-9436-779f35b04feb-121-image.png',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [
        {
          name: 'Bts',
          description: '전시 준비와 현장 비하인드 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/827e894e-1297-434d-9b34-62c255428571-122-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/631c4ab1-d13a-426e-8be0-9da2dc7416dd-123-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d9184ea5-eb47-4038-8149-ceb1d99cb04d-124-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ceb05760-71be-4069-9006-54ba7249dd4b-125-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b7574b6a-d638-458e-b640-10ad4e338723-126-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1040429c-6fe5-4634-8156-52cdc86f68f2-127-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ea4ecc6a-629b-40d8-9367-b4800d149b18-128-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d72c8dc7-f2a1-407d-aa72-b82d95d1405c-129-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/eb6810fe-f327-4259-9951-f0b6e60ebade-130-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/37af303f-7089-40bc-b7ee-94c10061bcbd-131-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b41a8f00-d360-4b6a-9f84-384cb05eeb72-132-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6666a595-95cb-4b02-82fb-4b1ae8852bbc-133-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/703b7648-bf01-48e6-a299-5e22a31940ac-134-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/99d6ab31-14d7-402c-9395-4da6df6b3e60-135-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a84f037b-d40c-4509-9123-b06eaf711687-136-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a5123162-9e6a-469f-a328-a028238c9691-137-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/82f1f19a-7841-4ad0-91f6-7a79d89b08f5-138-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b9801e3a-132c-42b7-8252-7c500bdc7631-139-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b9f2130d-91da-4847-8bc7-1335fe763961-140-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/32ac9c5b-fb8d-4e35-8bef-ef40c2ccb397-141-image.png',
            },
          ],
        },
        {
          name: "Artists' Notes",
          description: '작가 노트 대표 이미지',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7b5840a4-fbe1-483a-b755-25289bfc9db5-142-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/00342adf-9457-490a-a4c7-44684f6a1884-143-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/17a55edf-d022-450e-84ef-2230d34c25e2-144-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/280fa514-beea-4273-a823-5accdf5a7e1f-145-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4f0cf7e3-0779-4f00-9d50-4b6b176d2ccb-146-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fddf96f7-5651-4ba7-8f8c-c6d408cec9b2-147-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c88f043d-7cba-4b91-b4ee-355b0a8eeb39-148-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d604a18f-af6d-4dc8-9225-8c952f36af70-149-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/93706e97-b3fb-4229-80f9-0e8e2376009d-150-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/98bcb012-a38d-4c2d-a5df-e76bafecf7ab-151-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/88c49821-03ef-404c-95ff-43196958f586-152-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/67527a1d-bb25-4a98-805b-4ab4b97d44e6-153-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/490275df-228e-46e7-a552-3369225ee270-154-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d3b4ac2e-3bf1-41ff-aac0-d15a63816185-155-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/533ad324-227f-4aa9-b927-df4fc582923f-156-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ef5b021d-89f8-4fee-bd82-6c130614c13e-157-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/01d72b68-2f74-4b3d-a69f-7230af0f620c-158-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5335d670-d92d-4148-a174-1064cbd01dd4-159-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e911e487-c77f-4c6e-a653-1b600d7e7e73-160-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/503281b9-c7e5-403f-bfc1-e0a3398cb030-161-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/43192eb0-6344-4a62-bd94-63215fb807ca-162-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/eac0f99d-bdd7-463f-a301-b7fb89a41e44-163-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/bdf1ff87-0cce-4808-876a-c603ac90d8fc-164-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f8ae6529-e6cc-41c1-9080-6ef01b1a201c-165-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6a3be7b8-9908-4918-99d5-819ec316cad9-166-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7a1a12f8-532b-4191-8a4f-dc83faa9a2df-167-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/62e6a43c-d22c-43ac-9168-2038c42b177b-168-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8e665f39-4525-415d-8db4-4edb08c22dd6-169-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8535be3d-1aa9-4a6d-83f7-eec738e5e75f-170-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4f04d88c-061f-4bad-89ec-193acba17fac-171-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/48d95256-0b98-452e-85e9-248f8af1c023-172-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/77d8602d-a291-40dc-bae7-e4eb1abe1e2d-173-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d32fef23-e547-47d3-acd4-64e7badc876e-174-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f4e8f473-9a15-445d-921e-7614ed19a889-175-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/83587952-5cf0-4de9-9fea-40dbe9f956aa-176-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/61a3d1b8-e145-4516-af50-b7f31263d3d6-177-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/bcaa44a6-d2b9-4e49-9ff6-44dc84e538fe-178-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/25c5176a-f327-4c08-beed-6e3f92fd17d8-179-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6a8363c4-e07d-4b56-bdb8-b449a22265f3-180-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d92778ab-8e0b-4fe7-b67d-76f03cf8568f-181-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/793be2cb-5fc9-421d-b2d1-67ab43efb493-182-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/420389fb-ac95-4e15-b366-c8b8e4b26e9e-183-image.png',
            },
          ],
        },
        {
          name: 'Floor plan',
          description: '전시 플로어 플랜',
          images: [
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8d513aa4-b071-42ce-893d-6c459e397554-184-image.png',
            },
            {
              imageUrl:
                'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/477aeb17-2c67-4192-afa3-41577b5085e9-185-image.png',
            },
          ],
        },
      ],
    },
  },
  {
    displayId: 106,
    title: '디디다 - DDDA',
    subtitle: '2026 국민대학교 입체미술전공 야외조각전',
    content: null,
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
    contentCategories: [],
    posterSection: {
      title: '전시 포스터',
      images: [
        {
          imageUrl:
            'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/85b19621-5fb4-48dd-814e-f5a87a078169-211-709447876_18270813589293747_3830465497345304201_n.jpg',
        },
      ],
    },
    contentSection: {
      title: '전시 콘텐츠',
      categories: [],
    },
  },
];

export const MOCK_ARTWORK: MockArtwork[] = [
  {
    artworkId: 1001,
    displayId: 101,
    title: 'E202 번아웃 사건',
    artist: '김경준',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: 'PETG, 3D Modeling',
    size: '50 x 350 x 225 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/63b9af83-c318-4b7e-9f64-5f6bcd01787d-014-731495831_18055291016772787_9170671716912305948_n.jpg',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/59f384e5-e2e2-4856-96bc-6ec91d591a08-015-image.png',
      },
    ],
  },
  {
    artworkId: 1002,
    displayId: 101,
    title: '보를 찾습니다',
    artist: '황다겸',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: 'PETG, 3D Modeling',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/db6cccb9-1373-43cd-8a3d-76492b1f07a2-016-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/79ff3445-e15f-4f8d-bc07-31b06d216c57-017-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c88ed563-8027-4893-9b2c-9b8d980adf3c-018-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4a76ca8f-96a0-4f09-be1b-37c707c64393-019-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5c96062a-3cc9-4aca-a6c1-e366ef75f960-020-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/96546abf-5657-4c1b-81dc-5c4ea7ddb4d7-021-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fff81032-335e-48b0-a83e-3753ce74b58d-022-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/aa0b06bb-599f-49d0-8c48-8370aa9020b9-023-image.png',
      },
    ],
  },
  {
    artworkId: 1003,
    displayId: 101,
    title: 'In loving memory of Waehring',
    artist: '임유빈',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '빈티지 피아노, 나무 파레트',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6f824eed-cf9e-427c-b87e-db60e65c4224-024-729451785_18055308314772787_974033503289174244_n.jpg',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4ca2fdd6-5ee6-4090-819a-e4a449496901-025-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f0fe3b7d-8e11-453f-bb18-0edd41ef54cd-026-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/2cdda5f9-acb3-4437-be2b-594dfe48bbf0-027-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e3431c85-35c5-4ad9-8f34-c1e4adbdec28-028-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/082971db-4219-4186-ba19-0ee0c49f008f-029-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/367de0d6-aee3-4370-b9ce-23d667a3da39-030-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/3e209939-020e-432e-b256-0953d45c3368-031-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7a822212-d4fd-4fd1-8361-4513bf77b7ec-032-image.png',
      },
    ],
  },
  {
    artworkId: 1004,
    displayId: 101,
    title: '메두사호의 가장 높은 곳에서',
    artist: '배건이',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '빈티지 피아노, 나무 파레트, 테라코타, 앤틱 동전',
    size: '가변설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/21dd526a-0100-43b4-a319-4ebe79dd3ba2-033-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fe03d7bd-b075-4761-84b2-f8586e398214-034-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/63074845-1af8-4c21-8dbc-10b7aa9a1d07-035-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f992cb04-7086-4f98-86cc-1373ac2ddc39-036-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/74b012a3-14ea-4a34-a8d1-6b85b9616f47-037-image.png',
      },
    ],
  },
  {
    artworkId: 2001,
    displayId: 102,
    title: 'Chimera',
    artist: '서정우',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Wood/Metal',
    size: '가변 설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d852052e-769a-4d38-9e2b-ec0492112fc5-054-image.png',
      },
    ],
  },
  {
    artworkId: 2002,
    displayId: 102,
    title: 'Niki',
    artist: '서정우',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Metal',
    size: '가변 설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8906b305-9056-4ede-8f76-5671b2cc1e94-055-image.png',
      },
    ],
  },
  {
    artworkId: 2003,
    displayId: 102,
    title: 'Corpus Ambigumm',
    artist: '서정우',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Wood/Metal',
    size: '100 x 30 x 12 cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f1961a72-f20f-4386-a039-0a0c1698bffc-056-image.png',
      },
    ],
  },
  {
    artworkId: 2004,
    displayId: 102,
    title: 'Love Chaos',
    artist: '최예진',
    description: null,
    type: 'FASHION',
    productionYear: 2025,
    material: 'Fabric',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6b63818a-b5c4-480a-ad12-61037270d7de-057-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1926c0f9-6c27-4dcc-8c94-a3a2f7f50d86-058-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c9d7cb0c-286d-4578-9b66-e099c174133a-059-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/99d9e99d-541a-4061-a13a-0e8e57c8b447-060-image.png',
      },
    ],
  },
  {
    artworkId: 2005,
    displayId: 102,
    title: 'Void',
    artist: '최예진',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Metal',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/bc7a37f5-9b70-4e2d-900f-548338329b3e-061-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/58a3cc11-afeb-47f7-88fa-88d6582c5ef7-062-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c5bc225e-1ba9-4d5b-9e33-08718c1f6d64-063-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fb704cd2-6fb9-4654-8ed6-bb05d19eea18-064-image.png',
      },
    ],
  },
  {
    artworkId: 2006,
    displayId: 102,
    title: 'Waves',
    artist: '최예진',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Metal',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c16978d7-17e2-4928-ba5f-1aa6ae28ccf3-065-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/9cdcdb56-437c-4382-bdbb-e32db68f21ae-066-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8b7dcd78-5238-44fe-9371-847d35f32f21-067-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b6fc6181-20a9-450a-881d-d4a20f6e9182-068-image.png',
      },
    ],
  },
  {
    artworkId: 2007,
    displayId: 102,
    title: 'Spiral whif',
    artist: '최예진',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Metal',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/3cd87eee-f78a-4b3a-83db-870dd58ec82c-069-image.png',
      },
    ],
  },
  {
    artworkId: 2008,
    displayId: 102,
    title: '#.1 산류천석',
    artist: '김진아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Ceramic',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c2603367-39fb-4321-8577-71dbc4bd79c4-070-image.png',
      },
    ],
  },
  {
    artworkId: 2009,
    displayId: 102,
    title: '#.2 해타',
    artist: '김진아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Ceramic',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/0e69e79c-89ed-4ff8-bebb-918a2ee27b78-071-image.png',
      },
    ],
  },
  {
    artworkId: 2010,
    displayId: 102,
    title: '연피색',
    artist: '김진아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Wood',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/418f5ff2-fb9d-4d76-b30b-52bcc811a1fd-072-image.png',
      },
    ],
  },
  {
    artworkId: 2011,
    displayId: 102,
    title: 'Cobblestone',
    artist: '김진아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: 'Wood',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1076c108-fd9a-4367-9852-498227d7b1ec-073-image.png',
      },
    ],
  },
  {
    artworkId: 3001,
    displayId: 103,
    title: 'King James',
    artist: '임현도',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ee0d2d04-589b-4e01-9e01-1189880657b1-081-image.png',
      },
    ],
  },
  {
    artworkId: 3002,
    displayId: 103,
    title: '자전거도둑',
    artist: '안인재',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/3381aa26-9301-4916-8eee-6bba322c2d6c-082-image.png',
      },
    ],
  },
  {
    artworkId: 3003,
    displayId: 103,
    title: '흠신',
    artist: '최희건',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/81bc83b9-d04d-4a9d-a967-0e07d583ad3e-083-image.png',
      },
    ],
  },
  {
    artworkId: 3004,
    displayId: 103,
    title: '비포섬라이즈',
    artist: '김완승',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b1e4d534-2669-4341-8758-b537fd7d28d6-084-image.png',
      },
    ],
  },
  {
    artworkId: 3005,
    displayId: 103,
    title: '사랑, 그 놈',
    artist: '김지민',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/086d5d25-237e-4101-83e0-4e2fa7f50075-085-image.png',
      },
    ],
  },
  {
    artworkId: 3006,
    displayId: 103,
    title: '웃어, 윤',
    artist: '우윤서',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ac2ec35c-b48b-4fbf-82fb-c8d9b0a59337-086-image.png',
      },
    ],
  },
  {
    artworkId: 3007,
    displayId: 103,
    title: '너는 나 나는 너',
    artist: '정람아',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/3bd3001b-60ea-4b13-969b-8878a3c5d131-087-image.png',
      },
    ],
  },
  {
    artworkId: 3008,
    displayId: 103,
    title: '가출',
    artist: '서민현',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/2ca6d293-4174-4986-81a7-46ff6d0dc95a-088-image.png',
      },
    ],
  },
  {
    artworkId: 3009,
    displayId: 103,
    title: '데모데이',
    artist: '이철승',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d902acb6-a31e-4796-952f-d57277f9e460-089-image.png',
      },
    ],
  },
  {
    artworkId: 3010,
    displayId: 103,
    title: '여름 친구',
    artist: '김빈수',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a40278f1-a834-4689-8b98-32b38285d210-090-image.png',
      },
    ],
  },
  {
    artworkId: 3011,
    displayId: 103,
    title: '망할, 프레임',
    artist: '최성유',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/dbdfbd0b-b953-48bd-9d39-5ab1287dcffe-091-image.png',
      },
    ],
  },
  {
    artworkId: 3012,
    displayId: 103,
    title: 'Pacific Marine',
    artist: '고준상',
    description: null,
    type: 'PHOTOGRAPHY',
    productionYear: 2026,
    material: '디지털 피그먼트 프린트',
    size: '60 × 40 (cm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d3f4ea88-554e-4a5a-9a40-d2887a682ba5-092-image.png',
      },
    ],
  },
  {
    artworkId: 4001,
    displayId: 104,
    title: '낙원을 찾아서',
    artist: '강시진',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: '공단에 자수, 전통자수와 현대자수 혼합',
    size: '15x50cm / 30x50cm / 15x50cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e642e764-29eb-42bf-8429-d4de65d267ae-109-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7cf97b2a-e276-423c-bd91-4e51a5f313e0-110-image.png',
      },
    ],
  },
  {
    artworkId: 4002,
    displayId: 104,
    title: '삼족',
    artist: '강진구',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: '한지, 혼합 재료',
    size: '80x80x260cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1cc55e32-7150-438a-a626-6a87babc7edc-111-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a1d5d2d7-f83c-4485-9291-783318eefd01-112-image.png',
      },
    ],
  },
  {
    artworkId: 4003,
    displayId: 104,
    title: '함',
    artist: '강진구',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: '혼합 재료, DTF전사',
    size: '180x200x10cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4130f583-931b-40b5-b32f-5e5bffeb8776-113-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c84b5c58-c462-4c86-b87f-4658da86f40a-114-image.png',
      },
    ],
  },
  {
    artworkId: 4004,
    displayId: 104,
    title: '201시간 36분동안 멍때리기',
    artist: '고은아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: '수직실크에 면사',
    size: '79x100cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/531a65fb-6624-40e5-9e88-9c98d6679af7-115-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/13736a29-5f93-41f7-9f99-667e819fd94f-116-image.png',
      },
    ],
  },
  {
    artworkId: 4005,
    displayId: 104,
    title: '공명, 2025',
    artist: '고은아',
    description: null,
    type: 'CRAFT',
    productionYear: 2025,
    material: '큐빅, 울사 등 혼합재료',
    size: '109x158cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/8d92b4fe-6b9d-4ba2-9cac-c4e3a9a1a83f-117-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5ebd3e35-56df-418f-b452-17fd31db16db-118-image.png',
      },
    ],
  },
  {
    artworkId: 5001,
    displayId: 105,
    title: 'Legs of Reason',
    artist: '이가은',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: 'Stoneware',
    size: '가변 설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7a45d238-dd90-4028-8154-45cbf9eefb8c-186-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a369ffbc-8bfd-4652-8299-a529cb5f1a73-187-image.png',
      },
    ],
  },
  {
    artworkId: 5002,
    displayId: 105,
    title: 'Virtual landscape',
    artist: '김민주',
    description: null,
    type: 'DESIGN',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/105de39d-eaf6-403b-9951-313ef660d6e0-188-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/0aed7943-7fb3-4996-830d-3d598dea2fc8-189-image.png',
      },
    ],
  },
  {
    artworkId: 5003,
    displayId: 105,
    title: 'Everybody wants to rule the world',
    artist: '김민정',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '카세트 테이프, 평면',
    size: '1m×80cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e5107394-61d0-4089-b59e-a64e1218d018-190-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7aece2d2-0dd7-4413-aa94-826aa9622707-191-image.png',
      },
    ],
  },
  {
    artworkId: 5004,
    displayId: 105,
    title: '성 필립보 네리 축일의 고유 성무',
    artist: '한은경',
    description: null,
    type: 'CRAFT',
    productionYear: 2026,
    material: '나무,책, 오디오',
    size: '148x210mm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4c9b3403-1958-4fef-b8e1-4fbbe9c877cf-192-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4858093f-50ea-4ed3-b63c-5678478b52c3-193-image.png',
      },
    ],
  },
  {
    artworkId: 5005,
    displayId: 105,
    title: 'Joker',
    artist: '이정현',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '캔버스에 아크릴, ohp필름과 종이, 고투명 pet',
    size: '71.5 x 20cm',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/42e43af3-f01a-40cd-baba-eb2d84ea4b21-194-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/bccee874-390a-4b12-ba9e-24699fadb44e-195-image.png',
      },
    ],
  },
  {
    artworkId: 5006,
    displayId: 105,
    title: 'transparent wc',
    artist: '안정빈, 원다혜',
    description: null,
    type: 'DESIGN',
    productionYear: 2026,
    material: '혼합매체',
    size: '장소 특정적 설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5eb212c6-62e5-4407-89b2-5af218f1d5e8-196-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/67ec9264-734d-46a1-84c8-999bdc4e230b-197-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ec03bec9-96c6-4b11-84d6-c4883b8cd67a-198-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/bc16caac-1f4e-47da-a603-b26c64f3666c-199-image.png',
      },
    ],
  },
  {
    artworkId: 5007,
    displayId: 105,
    title: 'K-Jordan River',
    artist: '조연우',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '디지털 이미지, 프린트',
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6ea8211f-8e7b-46ff-910c-f50cb13d6f27-200-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f7719115-b49e-43d9-aa87-e942b88d346d-201-image.png',
      },
    ],
  },
  {
    artworkId: 5008,
    displayId: 105,
    title: '합의',
    artist: '정수아',
    description: null,
    type: 'DESIGN',
    productionYear: 2026,
    material: '광목',
    size: '가변 설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/0eab021a-8910-416d-b965-44f03df1d388-202-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7eb5f1e2-591f-49bb-9835-af20af4035da-203-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/981c8cb1-09d2-47d6-bd68-59d1cdf812df-204-image.png',
      },
    ],
  },
  {
    artworkId: 5009,
    displayId: 105,
    title: 'me me',
    artist: '차민사',
    description: null,
    type: 'DESIGN',
    productionYear: 2026,
    material: '미러타일에 잉크',
    size: '가변설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/a7036324-f5c1-46d4-b361-9ab4065eb603-205-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5e3fc9ee-56e5-4b49-8382-4a121df8f678-206-image.png',
      },
    ],
  },
  {
    artworkId: 5010,
    displayId: 105,
    title: '열',
    artist: '김수현',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: '적토, 라텍스, 곡물',
    size: '가변설치',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b67e6e7e-3068-4b50-803d-c36540ceabb4-207-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fb19f119-ea99-4576-b250-c4c55d11cd46-208-image.png',
      },
    ],
  },
  {
    artworkId: 5011,
    displayId: 105,
    title: '꿈이라고 불러도 좋은',
    artist: '박서영',
    description: null,
    type: 'DESIGN',
    productionYear: 2026,
    material: '우레탄 캐스팅, PVC파이프, 파우더, 에폭시퍼티, 대나무살',
    size: '800x900x50(mm)',
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7adbfc32-3298-4cf9-b5e4-7bf89be21d05-209-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/1644111f-80fb-4323-9281-b548258f6c4f-210-image.png',
      },
    ],
  },
  {
    artworkId: 6001,
    displayId: 106,
    title: '정동자실체',
    artist: '박희주',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/7fc0fa50-bc80-47bc-ab1e-d03064225f39-212-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/309601f5-4c39-417c-a3de-cec7762959c8-213-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c66137a8-cb16-45e9-bdf7-26a97c47b77e-214-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ee3ca416-6ef1-4849-af1d-44530ffb11cb-215-image.png',
      },
    ],
  },
  {
    artworkId: 6002,
    displayId: 106,
    title: '물때',
    artist: '전주현',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/b9f0f494-5ff5-455f-960a-bb33eaecc508-216-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d3e18298-c9a8-4814-b925-cf79cf1b86da-217-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ce055799-f987-40ef-b686-369bf2f6edc6-218-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/6f4915ec-00ab-44c6-a4a8-d94095e79f40-219-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/9fe60fe8-a51f-4534-8ece-a9d72b6356fe-220-image.png',
      },
    ],
  },
  {
    artworkId: 6003,
    displayId: 106,
    title: '허무가 차오르는 정오에는 여기서 만나기로 해',
    artist: '채시원',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/ec8e789e-218a-4be3-9ae6-199a2ab379b5-221-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/47618bd4-5b74-4762-bf59-9c089a06f770-222-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/501cc366-8637-452d-b50a-8af2ce047837-223-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/fb2d2dfa-f340-4ca0-845e-1a28d7cc0f41-224-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f43ee34c-87ae-4568-aa3f-d02bfee975ad-225-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c7fca337-8ab1-4ad7-b160-cb614e632e45-226-image.png',
      },
    ],
  },
  {
    artworkId: 6004,
    displayId: 106,
    title: 'Liquid Cat',
    artist: '정민선',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/37ebd44b-0f63-4cd0-81d6-5d4335849fec-227-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c570aac4-148c-48a1-abc9-031896c0c64a-228-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/06488642-001f-431f-8772-c4ff63ded1e9-229-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/d76b307c-8d71-40d8-a1b5-cf3b9f49e1a6-230-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/969e6db7-2d74-43c6-9527-9a0de2728ee4-231-image.png',
      },
    ],
  },
  {
    artworkId: 6005,
    displayId: 106,
    title: 'Neoteny',
    artist: '전희원',
    description: null,
    type: 'SCULPTURE',
    productionYear: 2026,
    material: null,
    size: null,
    point: null,
    images: [
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/40db7884-3191-4600-9ebb-d1ba215120ed-232-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/c1e44e4e-ed3c-49ff-8bce-10002772e6de-233-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/e3f650fb-b6e6-4835-8e46-ca6d9bcf06fd-234-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/4c60695e-710d-4250-9adc-6af64f25cd39-235-image.png',
      },
      {
        imageUrl:
          'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/5f72d2ad-9bdd-4da7-961e-8ae46ecc1612-236-image.png',
      },
    ],
  },
];
