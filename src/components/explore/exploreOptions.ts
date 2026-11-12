export type ExploreOption = {
  label: string;
  value: string | null;
};

export type ExploreView = 'exhibition' | 'artwork';

export const EXPLORE_VIEW_OPTIONS: ReadonlyArray<{ label: string; value: ExploreView }> = [
  { label: '전시', value: 'exhibition' },
  { label: '작품', value: 'artwork' },
];

export const FIELD_OPTIONS: readonly ExploreOption[] = [
  { label: '전체', value: null },
  { label: '회화', value: 'PAINTING' },
  { label: '조소', value: 'SCULPTURE' },
  { label: '사진', value: 'PHOTOGRAPHY' },
  { label: '그래픽', value: 'GRAPHIC' },
  { label: '브랜딩', value: 'BRANDING' },
  { label: '제품', value: 'PRODUCT' },
  { label: '영상', value: 'VIDEO' },
  { label: '공간', value: 'SPACE' },
  { label: '건축', value: 'ARCHITECTURE' },
  { label: 'UXUI', value: 'UXUI' },
  { label: '공예', value: 'CRAFTS' },
  { label: '기타', value: 'OTHERS' },
];

export const TYPE_OPTIONS: readonly ExploreOption[] = [
  { label: '전체', value: null },
  { label: '졸업 전시', value: 'GRADUATION' },
  { label: '학과·학회 전시', value: 'DEPARTMENTS' },
  { label: '과제 전시', value: 'ASSIGNMENTS' },
  { label: '연합 전시', value: 'INTER_GROUP' },
  { label: '소모임·동아리 전시', value: 'SMALL_GROUP' },
  { label: '기타 단체 전시', value: 'OTHERS' },
];

export const STATUS_OPTIONS: readonly ExploreOption[] = [
  { label: '전체', value: null },
  { label: '전시 중', value: 'ONGOING' },
  { label: '전시 예정', value: 'UPCOMING' },
  { label: '종료', value: 'ENDED' },
];

// 검색 API가 아직 정렬을 받지 않아(전시 ID 내림차순 고정) 화면 상태로만 둔다.
export const SORT_OPTIONS: readonly ExploreOption[] = [
  { label: '최신순', value: 'LATEST' },
  { label: '인기순', value: 'POPULAR' },
];

const normalizeLabel = (label: string) => label.replace(/[\s·]/g, '');

// 홈 화면 링크가 '졸업 전시'처럼 라벨로 넘기므로 띄어쓰기·가운뎃점 차이를 무시하고 찾는다.
export const findOptionByLabel = (options: readonly ExploreOption[], label: string | null) => {
  if (!label) return options[0];
  const target = normalizeLabel(label);
  return options.find((option) => normalizeLabel(option.label) === target) ?? options[0];
};
