import p01 from '@/assets/brand/posters/p01.jpg';
import p02 from '@/assets/brand/posters/p02.jpg';
import p03 from '@/assets/brand/posters/p03.jpg';
import p04 from '@/assets/brand/posters/p04.jpg';
import p05 from '@/assets/brand/posters/p05.jpg';
import p06 from '@/assets/brand/posters/p06.jpg';
import p07 from '@/assets/brand/posters/p07.jpg';
import p08 from '@/assets/brand/posters/p08.jpg';
import p09 from '@/assets/brand/posters/p09.jpg';
import p10 from '@/assets/brand/posters/p10.jpg';
import p11 from '@/assets/brand/posters/p11.jpg';

export type BrandExhibitionStatus = '전시 중' | '전시 예정' | '종료';

export interface BrandExhibition {
  index: number;
  title: string;
  school: string;
  dateRange: string;
  status: BrandExhibitionStatus;
  poster: string;
}

// 프로토타입 데모 데이터(assets/demo-data.js) 그대로. 상태는 프로토타입의 고정 데모 시계(2026-12-05) 기준 값이다
export const BRAND_EXHIBITIONS: readonly BrandExhibition[] = [
  {
    index: 0,
    title: '펼쳐지는 장면',
    school: '모아디자인대학교 시각디자인학과',
    dateRange: '2027.11.12 - 11.18',
    status: '전시 예정',
    poster: p01,
  },
  {
    index: 1,
    title: '다른 곳에서 자라기',
    school: '마루조형대학교 조소과',
    dateRange: '2027.11.12 - 11.18',
    status: '전시 예정',
    poster: p02,
  },
  {
    index: 2,
    title: '픽셀의 정원',
    school: '솔온미디어대학교 미디어디자인학과',
    dateRange: '2027.11.12 - 11.18',
    status: '전시 예정',
    poster: p03,
  },
  {
    index: 3,
    title: '완성 이전의 순간',
    school: '아람예술대학교 도예과',
    dateRange: '2027.11.12 - 11.18',
    status: '전시 예정',
    poster: p04,
  },
  {
    index: 4,
    title: '미완의 세계',
    school: '온결예술대학교 웹툰창작학과',
    dateRange: '2026.11.26 - 11.28',
    status: '종료',
    poster: p05,
  },
  {
    index: 5,
    title: '재생 중',
    school: '미온대학교 디지털콘텐츠전공',
    dateRange: '2026.12.02 - 12.07',
    status: '전시 중',
    poster: p06,
  },
  {
    index: 6,
    title: '사용 이후',
    school: '마루디자인대학교 산업융합디자인학과',
    dateRange: '2026.11.16 - 11.18',
    status: '종료',
    poster: p07,
  },
  {
    index: 7,
    title: '빛이 지나간 자리',
    school: '해온예술대학교 사진미디어학과',
    dateRange: '2026.12.04 - 12.06',
    status: '전시 중',
    poster: p08,
  },
  {
    index: 8,
    title: '한 칸 너머',
    school: '나루예술대학교 만화애니메이션학과',
    dateRange: '2026.11.09 - 11.13',
    status: '종료',
    poster: p09,
  },
  {
    index: 9,
    title: '매듭의 방향',
    school: '모루예술대학교 섬유예술전공',
    dateRange: '2026.12.03 - 12.09',
    status: '전시 중',
    poster: p10,
  },
  {
    index: 10,
    title: '사이의 치수',
    school: '소요디자인대학교 실내건축디자인학과',
    dateRange: '2026.11.20 - 11.22',
    status: '종료',
    poster: p11,
  },
];

const STATUS_ORDER: Record<BrandExhibitionStatus, number> = {
  '전시 중': 0,
  '전시 예정': 1,
  종료: 2,
};

// 전시 중 → 전시 예정 → 종료 순(작가 프로필 정렬과 같음), 같은 상태 안은 데이터 순서
export const sortByStatus = (list: readonly BrandExhibition[]) =>
  [...list].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.index - b.index);
