import type { ArtworkPreviewItem, DuPickItem, ExhibitionCardData, LoungePost } from '@/types/home';

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

export const GRADUATION_EXHIBITIONS: ExhibitionCardData[] = [
  {
    id: '1',
    title: 'FORM 2026',
    school: '중앙대학교 디자인학부',
    period: '05.28 - 06.05',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    school: '홍익대학교 시각디자인',
    period: '06.02 - 06.10',
  },
  {
    id: '3',
    title: 'NEW OFFICE',
    school: '홍익대학교 시각디자인',
    period: '06.02 - 06.10',
  },
];

export const DEADLINE_EXHIBITIONS: ExhibitionCardData[] = [
  {
    id: '1',
    title: 'FORM 2026',
    school: '중앙대학교 디자인학부',
    period: '05.28 - 06.10',
  },
  {
    id: '2',
    title: 'VISUAL WAVE',
    school: '홍익대학교 시각디자인',
    period: '06.02 - 06.10',
  },
  {
    id: '3',
    title: 'NEW OFFICE',
    school: '홍익대학교 시각디자인',
    period: '06.02 - 06.10',
  },
];

export const ARTWORK_ITEMS: ArtworkPreviewItem[] = [
  {
    id: '1',
    name: '색과 형태, 우리가 마주한 순간들',
    date: '2026.05.23 – 05.30',
    location: '중앙대학교 301관',
  },
  {
    id: '2',
    name: '색과 형태, 우리가 마주한 순간들 2',
    date: '2026.05.23 – 05.30',
    location: '중앙대학교 301관',
  },
  {
    id: '3',
    name: '색과 형태, 우리가 마주한 순간들 3',
    date: '2026.05.23 – 05.30',
    location: '중앙대학교 301관',
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
