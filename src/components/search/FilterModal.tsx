import { useEffect, useRef } from 'react';

import cancelIcon from '../../assets/cancel.svg';

import { FilterChip } from './FilterChip';
import { FILTER_TAB_OPTIONS, FILTER_TABS, type FilterState, type FilterTab } from './filterOptions';

type FilterModalProps = {
  activeTab: FilterTab;
  filters: FilterState;
  onActiveTabChange: (tab: FilterTab) => void;
  onApply: () => void;
  onFilterChange: (tab: FilterTab, value: string) => void;
  onClose: () => void;
  onResetAndApply: () => void;
};

export function FilterModal({
  activeTab,
  filters,
  onActiveTabChange,
  onApply,
  onFilterChange,
  onClose,
  onResetAndApply,
}: FilterModalProps) {
  const activeValue = filters[activeTab];
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button
        aria-label="필터 닫기"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby="filter-modal-title"
        aria-modal="true"
        className="relative mx-auto flex h-[701px] w-full max-w-[402px] flex-col overflow-hidden rounded-t-xl bg-white"
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

        <div className="flex items-center border-b border-[#D9D9D9] px-5 shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
          {FILTER_TABS.map((tab) => (
            <button
              className={`h-11 px-2.5 text-sm ${
                tab === activeTab
                  ? 'border-b-2 border-neutral-900 font-bold text-neutral-900'
                  : 'font-normal text-neutral-400'
              }`}
              key={tab}
              onClick={() => onActiveTabChange(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {activeValue !== '전체' ? (
          <div className="flex items-center justify-between bg-neutral-100 px-5 py-3">
            <button
              className="flex shrink-0 items-center gap-1 text-xs tracking-tight whitespace-nowrap text-neutral-600"
              onClick={() => onFilterChange(activeTab, '전체')}
              type="button"
            >
              {activeValue} <img alt="" className="size-4" src={cancelIcon} />
            </button>
            <button
              className="shrink-0 text-xs tracking-tight whitespace-nowrap text-neutral-600 underline"
              onClick={onResetAndApply}
              type="button"
            >
              초기화
            </button>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-3">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {FILTER_TAB_OPTIONS[activeTab].map((option) => (
              <FilterChip
                key={option}
                label={option}
                onClick={() => onFilterChange(activeTab, option)}
                selected={activeValue === option}
              />
            ))}
          </div>
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
