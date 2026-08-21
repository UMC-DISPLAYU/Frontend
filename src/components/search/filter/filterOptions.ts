import type { FilterState, FilterTab } from '@/types/search';

export const FILTER_TABS: readonly FilterTab[] = ['전시분야', '전시상태', '지역', '전시유형'];

type FilterOption = {
  label: string;
  value: string | null;
};

type FilterConfig = {
  param: 'field' | 'region' | 'status' | 'type';
  options: FilterOption[];
};

const ALL_OPTION = { label: '전체', value: null };

export const FILTER_CONFIG: Record<FilterTab, FilterConfig> = {
  전시분야: {
    param: 'field',
    options: [
      ALL_OPTION,
      { label: '회화', value: 'PAINTING' },
      { label: '디자인', value: 'DESIGN' },
      { label: '사진', value: 'PHOTOGRAPHY' },
      { label: '건축', value: 'ARCHITECTURE' },
      { label: '영상', value: 'VIDEO' },
      { label: '조소', value: 'SCULPTURE' },
      { label: '패션', value: 'FASHION' },
      { label: '일러스트', value: 'INTERDISCIPLINARY' },
      { label: '공예', value: 'CRAFT' },
      { label: '기타', value: 'OTHERS' },
    ],
  },
  전시상태: {
    param: 'status',
    options: [
      { label: '전시중', value: 'ONGOING' },
      { label: '전시예정', value: 'UPCOMING' },
      { label: '종료예정', value: 'CLOSING_SOON' },
      { label: '종료', value: 'ENDED' },
    ],
  },
  전시유형: {
    param: 'type',
    options: [
      { label: '졸업 전시', value: 'GRADUATION' },
      { label: '학과·학회 전시', value: 'DEPARTMENTS' },
      { label: '과제 전시', value: 'ASSIGNMENTS' },
      { label: '연합 전시', value: 'INTER_GROUP' },
      { label: '소모임·동아리 전시', value: 'SMALL_GROUP' },
      { label: '기타 단체 전시', value: 'OTHERS' },
    ],
  },
  지역: {
    param: 'region',
    options: [
      { label: '서울', value: 'SEOUL' },
      { label: '경기·인천', value: 'GYEONGGI_INCHEON' },
      { label: '그 외 지역', value: 'OTHERS' },
    ],
  },
};

const getLabels = (options: FilterOption[]) => options.map(({ label }) => label);

export const FIELD_OPTIONS = getLabels(FILTER_CONFIG['전시분야'].options);
export const STATUS_OPTIONS = getLabels(FILTER_CONFIG['전시상태'].options);
export const REGION_OPTIONS = getLabels(FILTER_CONFIG['지역'].options);
export const TYPE_OPTIONS = getLabels(FILTER_CONFIG['전시유형'].options);

export const FILTER_TAB_OPTIONS: Record<FilterTab, string[]> = {
  전시분야: FIELD_OPTIONS,
  전시상태: STATUS_OPTIONS,
  전시유형: TYPE_OPTIONS,
  지역: REGION_OPTIONS,
};

export const DEFAULT_FILTER_STATE: FilterState = {
  전시분야: null,
  전시상태: null,
  전시유형: null,
  지역: null,
};

export const getFilterOptionValue = ({ options }: FilterConfig, label: string | null) => {
  if (!label) return null;
  return options.find((option) => option.label === label)?.value ?? null;
};
