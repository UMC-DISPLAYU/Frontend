export const FILTER_TABS = ['전시분야', '전시상태', '지역', '전시유형'] as const;

export type FilterTab = (typeof FILTER_TABS)[number];

export const FIELD_OPTIONS = [
  '전체',
  '회화',
  '디자인',
  '사진',
  '건축',
  '영상',
  '조소',
  '패션',
  '일러스트',
  '공예',
  '기타',
];

export const STATUS_OPTIONS = ['전시중', '전시예정', '종료예정', '종료'];

export const REGION_OPTIONS = ['서울', '경기·인천', '그 외 지역'];

export const TYPE_OPTIONS = [
  '졸업 전시',
  '학과·학회 전시',
  '과제 전시',
  '연합 전시',
  '소모임·동아리 전시',
  '기타 단체 전시',
];

export const FILTER_TAB_OPTIONS: Record<FilterTab, string[]> = {
  전시분야: FIELD_OPTIONS,
  전시상태: STATUS_OPTIONS,
  전시유형: TYPE_OPTIONS,
  지역: REGION_OPTIONS,
};

export type FilterState = Record<FilterTab, string>;

export const DEFAULT_FILTER_STATE: FilterState = {
  전시분야: '전체',
  전시상태: '전체',
  전시유형: '전체',
  지역: '전체',
};
