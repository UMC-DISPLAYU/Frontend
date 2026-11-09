import type { HomeExhibitionTab } from '@/hooks/queries/useHome';

export const HOME_TABS: readonly { key: HomeExhibitionTab; label: string; emptyText: string }[] = [
  { key: 'pop', label: '인기 전시', emptyText: '진행 중이거나 예정된 전시가 없어요' },
  { key: 'grad', label: '졸업전시', emptyText: '진행 중이거나 예정된 졸업전시가 없어요' },
  { key: 'live', label: '전시 중', emptyText: '진행 중인 전시가 없어요' },
  { key: 'soon', label: '전시 예정', emptyText: '예정된 전시가 없어요' },
  { key: 'end', label: '마감 임박', emptyText: '곧 끝나는 전시가 없어요' },
];

export const parseHomeTab = (value: string | null): HomeExhibitionTab =>
  HOME_TABS.find((tab) => tab.key === value)?.key ?? 'pop';
