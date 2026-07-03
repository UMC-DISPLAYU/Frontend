export type RegionFilterValue = 'all' | 'gyeonggiIncheon' | 'other' | 'seoul';
export type StatusFilterValue = 'all' | 'ended' | 'ongoing' | 'upcoming';

export const STATUS_FILTER_OPTIONS: Array<{ label: string; value: StatusFilterValue }> = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'ongoing' },
  { label: '전시 예정', value: 'upcoming' },
  { label: '종료', value: 'ended' },
];

export const REGION_FILTER_OPTIONS: Array<{ label: string; value: RegionFilterValue }> = [
  { label: '전체', value: 'all' },
  { label: '서울', value: 'seoul' },
  { label: '경기·인천', value: 'gyeonggiIncheon' },
  { label: '그 외 지역', value: 'other' },
];

export const FIELD_FILTER_OPTIONS = [
  '회화',
  '디자인',
  '사진',
  '건축',
  '영상',
  '공예',
  '조각',
  '패션',
  '복합',
  '기타',
];

export const TYPE_FILTER_OPTIONS = [
  '졸업 전시',
  '학회·소모임·동아리 전시',
  '과제 전시',
  '연합 전시·동아리 전시',
  '소모임·연합 전시',
  '기타 단체 전시',
];
