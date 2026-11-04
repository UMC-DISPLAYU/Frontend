import type { DropdownOption } from '@/components/ui';

export type ExploreOption = DropdownOption;

export type ExploreView = 'exhibition' | 'artwork';

export const EXPLORE_VIEW_OPTIONS: ReadonlyArray<{ label: string; value: ExploreView }> = [
  { label: '전시', value: 'exhibition' },
  { label: '작품', value: 'artwork' },
];

// 그래픽·브랜딩·제품·가구·공간·UXUI는 아직 백엔드 분야 값이 없어 전체로 조회된다.
export const FIELD_OPTIONS: readonly ExploreOption[] = [
  { label: '전체', value: null },
  { label: '회화', value: 'PAINTING' },
  { label: '조소', value: 'SCULPTURE' },
  { label: '사진', value: 'PHOTOGRAPHY' },
  { label: '그래픽', value: null },
  { label: '브랜딩', value: null },
  { label: '제품', value: null },
  { label: '가구', value: null },
  { label: '공간', value: null },
  { label: 'UXUI', value: null },
  { label: '공예', value: 'CRAFT' },
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
  { label: '전시중', value: 'ONGOING' },
  { label: '전시 예정', value: 'UPCOMING' },
  { label: '종료', value: 'ENDED' },
];

// 정렬은 아직 검색 API가 받지 않아 화면 상태로만 둔다.
export const SORT_OPTIONS: readonly ExploreOption[] = [
  { label: '최신순', value: 'LATEST' },
  { label: '오래된순', value: 'OLDEST' },
  { label: '마감 임박순', value: 'CLOSING_SOON' },
  { label: '인기순', value: 'POPULAR' },
];

const normalizeLabel = (label: string) => label.replace(/[\s·]/g, '');

// 홈 화면 링크가 '졸업 전시'처럼 라벨로 넘기므로 띄어쓰기·가운뎃점 차이를 무시하고 찾는다.
export const findOptionByLabel = (options: readonly ExploreOption[], label: string | null) => {
  if (!label) return options[0];
  const target = normalizeLabel(label);
  return options.find((option) => normalizeLabel(option.label) === target) ?? options[0];
};
