import type { HomeExhibitionDto } from '@/api/dto';

export const MOCK_EXHIBITIONS: HomeExhibitionDto[] = [
  {
    displayId: 1,
    title: '색과 형태, 우리가 마주한 순간들',
    posterImageUrl: 'https://picsum.photos/seed/ex1/300/400',
    isBookmarked: true,
    startedAt: '2026-05-23',
    endedAt: '2026-05-30',
  },
  {
    displayId: 2,
    title: 'VISUAL WAVE',
    posterImageUrl: 'https://picsum.photos/seed/vw1/300/400',
    isBookmarked: false,
    startedAt: '2026-06-02',
    endedAt: '2026-06-10',
  },
  {
    displayId: 3,
    title: '절벽 위에서',
    posterImageUrl: 'https://picsum.photos/seed/no1/300/400',
    isBookmarked: false,
    startedAt: '2026-06-02',
    endedAt: '2026-06-10',
  },
];
