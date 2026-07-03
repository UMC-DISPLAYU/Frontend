import type { Exhibition } from './types';

export const EXHIBITIONS: Exhibition[] = [
  {
    dateRange: '2026.05.10 – 05.17',
    id: 'space-sense',
    location: '서울대학교 미술관 1층',
    status: 'ongoing',
    subtitle: '서울대학교 디자인학부 졸업전시',
    thumbnailClassName: 'bg-slate-300',
    title: '공간을 잇는 감각',
  },
  {
    dateRange: '2026.05.20 – 05.28',
    id: 'inner-scenery',
    location: '홍익대학교 현대미술관',
    status: 'upcoming',
    subtitle: '홍익대학교 회화학과 과제 전시',
    thumbnailClassName: 'bg-zinc-300',
    title: '내면의 풍경',
  },
  {
    dateRange: '2026.03.08 – 03.15',
    id: 'boundless-color',
    location: '홍익대학교 현대미술관',
    status: 'endingSoon',
    subtitle: '중앙대학교 금속조형디자인과 과제 전시',
    thumbnailClassName: 'bg-stone-300',
    title: '경계 없는 색채',
  },
  {
    dateRange: '2026.06.10 – 06.20',
    id: 'quiet-flow-of-light',
    location: '디스플레이U 갤러리 1관',
    status: 'upcoming',
    subtitle: '중앙대학교 OO동아리 회화 전시',
    thumbnailClassName: 'bg-gray-300',
    title: '빛의 결 | 조용한 흐름',
  },
];
