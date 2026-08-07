import { useEffect, useRef } from 'react';

import { X } from 'lucide-react';

import type { FilterState, FilterTab } from '@/types/search';

import { FilterChip } from './FilterChip';
import { FILTER_TAB_OPTIONS, FILTER_TABS } from './filterOptions';

type FilterModalProps = {
  filters: FilterState;
  onApply: () => void;
  onFilterChange: (tab: FilterTab, value: string) => void;
  onClose: () => void;
  onReset: () => void;
  onResetAndApply: () => void;
};

export function FilterModal({
  filters,
  onApply,
  onFilterChange,
  onClose,
  onReset,
  onResetAndApply,
}: FilterModalProps) {
  const activeEntries = (Object.entries(filters) as Array<[FilterTab, string[]]>).flatMap(
    ([tab, values]) => (values ?? []).map((val) => ({ tab, value: val })),
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex flex-col justify-end">
      {/* 필터 배경 오버레이 */}
      <button
        aria-label="필터 닫기"
        className="absolute inset-0 bg-black/60 cursor-pointer"
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby="filter-modal-title"
        aria-modal="true"
        className="relative mx-auto flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-xl bg-card shadow-2xl"
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <h2 className="typo-body-xl-bold text-main">필터</h2>
          <button
            aria-label="닫기"
            className="flex items-center justify-center text-main cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <X size={30} strokeWidth={1} />
          </button>
        </div>

        {activeEntries.length > 0 ? (
          <div className="flex items-center justify-between bg-box100 px-5 py-3">
            <div className="flex flex-wrap gap-2.5">
              {activeEntries.map(({ tab, value }) => (
                <button
                  className="flex shrink-0 items-center gap-1 typo-body-xs-regular text-sub600 whitespace-nowrap cursor-pointer"
                  key={`${tab}-${value}`}
                  onClick={() => onFilterChange(tab, value)}
                  type="button"
                >
                  {value} <X size={12} />
                </button>
              ))}
            </div>
            <button
              className="shrink-0 typo-body-xs-regular text-sub600 underline cursor-pointer"
              onClick={onReset}
              type="button"
            >
              초기화
            </button>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-8 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <div className="flex flex-col pt-3 gap-4" key={tab}>
              <div className="-mx-5 flex items-center self-stretch px-5">
                <h3 className="typo-body-sm-bold text-main inline-block w-fit border-b-2 border-main pb-2">
                  {tab}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {FILTER_TAB_OPTIONS[tab].map((option) => {
                  const isOptionSelected =
                    option === '전체'
                      ? (filters[tab] ?? []).length === 0 || (filters[tab] ?? []).includes('전체')
                      : (filters[tab] ?? []).includes(option);

                  return (
                    <FilterChip
                      key={option}
                      label={option}
                      onClick={() => onFilterChange(tab, option)}
                      selected={isOptionSelected}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-line-soft px-5 pt-3 pb-11.5 bg-card">
          <button
            className="flex h-11 w-full items-center justify-center rounded-sm bg-bt-black typo-body-sm-bold text-white cursor-pointer active:scale-[0.99] transition-transform"
            onClick={onApply}
            type="button"
          >
            전시보기
          </button>
          <button
            className="self-stretch text-center typo-body-md-regular text-sub700 underline cursor-pointer"
            onClick={onResetAndApply}
            type="button"
          >
            선택초기화하고 전시보기
          </button>
        </div>
      </div>
    </div>
  );
}
