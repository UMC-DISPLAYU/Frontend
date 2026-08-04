import { useEffect, useRef } from 'react';

import type { FilterState, FilterTab } from '@/types/search';

import cancelIcon from '../../assets/cancel.svg';

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
  const activeEntries = (Object.entries(filters) as Array<[FilterTab, string]>).filter(
    ([, value]) => value !== '전체',
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <button
        aria-label="필터 닫기"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby="filter-modal-title"
        aria-modal="true"
        className="relative mx-auto mt-[129px] flex w-full max-w-[402px] flex-1 flex-col overflow-hidden rounded-t-xl bg-white"
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <h2
            className="text-xl leading-6 font-bold tracking-wide text-neutral-900"
            id="filter-modal-title"
          >
            필터
          </h2>
          <button aria-label="닫기" onClick={onClose} type="button">
            <img alt="" className="size-[26px]" src={cancelIcon} />
          </button>
        </div>

        {activeEntries.length > 0 ? (
          <div className="flex items-center justify-between bg-neutral-100 px-5 py-3">
            <div className="flex flex-wrap gap-2.5">
              {activeEntries.map(([tab, value]) => (
                <button
                  className="flex shrink-0 items-center gap-1 text-xs tracking-tight whitespace-nowrap text-neutral-600"
                  key={tab}
                  onClick={() => onFilterChange(tab, '전체')}
                  type="button"
                >
                  {value} <img alt="" className="size-4" src={cancelIcon} />
                </button>
              ))}
            </div>
            <button
              className="shrink-0 text-xs tracking-tight whitespace-nowrap text-neutral-600 underline"
              onClick={onReset}
              type="button"
            >
              초기화
            </button>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-5 pt-3 pb-[33px] scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <div className="flex flex-col gap-4" key={tab}>
              <div className="-mx-5 flex items-center self-stretch px-5">
                <h3 className="typo-body-sm-bold text-main inline-block w-fit border-b-2 border-neutral-900 pb-3">
                  {tab}
                </h3>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {FILTER_TAB_OPTIONS[tab].map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    onClick={() => onFilterChange(tab, option)}
                    selected={filters[tab] === option}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-[#E9E9E9] px-5 pt-3 pb-[46px]">
          <button
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-sm bg-neutral-900 text-sm font-bold text-neutral-50"
            onClick={onApply}
            type="button"
          >
            전시보기
          </button>
          <button
            className="self-stretch text-center text-base leading-[140%] font-normal tracking-[-0.48px] text-[#505050] underline"
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
