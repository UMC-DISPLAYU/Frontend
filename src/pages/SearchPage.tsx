import { useMemo, useState } from 'react';

import cancelIcon from '../assets/cancel.svg';
import filterIcon from '../assets/filter.svg';
import filterSelectedDotIcon from '../assets/filter-selected-dot.svg';
import searchIcon from '../assets/search.svg';
import {
  DEFAULT_FILTER_STATE,
  ExhibitionCard,
  EXHIBITIONS,
  FIELD_OPTIONS,
  FilterChip,
  FilterModal,
  type FilterState,
  type FilterTab,
} from '../components/search';

type ExploreTab = 'list' | 'map';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ExploreTab>('list');

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<FilterTab>('전시분야');

  const filteredExhibitions = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return EXHIBITIONS;
    return EXHIBITIONS.filter((exhibition) => exhibition.title.includes(keyword));
  }, [query]);

  const activeFilterEntries = (Object.entries(filters) as Array<[FilterTab, string]>).filter(
    ([, value]) => value !== '전체',
  );

  const updateFilter = (tab: FilterTab, value: string) => {
    setFilters((prev) => ({ ...prev, [tab]: prev[tab] === value ? '전체' : value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTER_STATE);

  return (
    <div className="mx-auto flex w-full min-w-[320px] max-w-[402px] flex-col bg-gray-100">
      <div className="flex flex-col bg-gray-100 px-5 pt-5">
        <div className="flex h-[62px] flex-col justify-start gap-1 self-stretch">
          <h1 className="font-['Aldrich'] text-[32px] leading-[140%] font-normal tracking-[-0.96px] text-[#06032D]">
            Explore
          </h1>
          <p className="text-xs text-neutral-500">저장한 전시와 작품, 작가를 다시 꺼내보세요.</p>
        </div>

        <div className="mt-2.5 flex h-10 items-center justify-between rounded-xl bg-[#FCFCFC] px-5 py-2.5 shadow-[-1px_-1px_1px_0px_#FFF_inset,1px_1px_1px_0px_rgba(0,0,0,0.10)_inset]">
          <input
            className="h-5 flex-1 bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            type="text"
            value={query}
          />
          <img alt="" className="size-5" src={searchIcon} />
        </div>

        <div className="flex h-11 items-end border-b border-[#D9D9D9] shadow-[0px_0px_18px_0px_rgba(67,0,209,0.04)]">
          <button
            className={`px-0 pr-5 pb-3 text-sm ${
              activeTab === 'list'
                ? 'border-b-2 border-neutral-900 font-bold text-neutral-900'
                : 'font-normal text-neutral-400'
            }`}
            onClick={() => setActiveTab('list')}
            type="button"
          >
            전시목록
          </button>
          <button
            className={`px-0 pb-3 text-sm ${
              activeTab === 'map'
                ? 'border-b-2 border-neutral-900 font-bold text-neutral-900'
                : 'font-normal text-neutral-400'
            }`}
            onClick={() => setActiveTab('map')}
            type="button"
          >
            지도
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="flex items-center gap-1.5 px-5 pt-[14px]">
            <button
              aria-label="필터"
              className="relative flex size-7 shrink-0 items-center justify-center rounded-sm outline outline-1 -outline-offset-1 outline-stone-300"
              onClick={() => {
                setModalTab('전시분야');
                setModalOpen(true);
              }}
              type="button"
            >
              <img alt="" className="size-3.5" src={filterIcon} />
              {activeFilterEntries.length > 0 ? (
                <img alt="" className="absolute top-1 right-1 size-1" src={filterSelectedDotIcon} />
              ) : null}
            </button>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {FIELD_OPTIONS.map((field) => (
                <FilterChip
                  key={field}
                  label={field}
                  onClick={() => updateFilter('전시분야', field)}
                  selected={filters['전시분야'] === field}
                />
              ))}
            </div>
          </div>

          {activeFilterEntries.length > 0 ? (
            <div className="flex items-center justify-between px-5 pt-2.5">
              <div className="flex flex-wrap gap-2.5">
                {activeFilterEntries.map(([tab, value]) => (
                  <button
                    className="flex shrink-0 items-center gap-1 text-xs tracking-tight whitespace-nowrap text-neutral-600"
                    key={tab}
                    onClick={() => updateFilter(tab, value)}
                    type="button"
                  >
                    {value} <img alt="" className="size-4" src={cancelIcon} />
                  </button>
                ))}
              </div>
              <button
                className="shrink-0 text-xs tracking-tight whitespace-nowrap text-neutral-600 underline"
                onClick={resetFilters}
                type="button"
              >
                초기화
              </button>
            </div>
          ) : null}

          <div className="px-5 pt-4 pb-24">
            {filteredExhibitions.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">검색 결과가 없어요</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
                {filteredExhibitions.map((exhibition) => (
                  <ExhibitionCard exhibition={exhibition} key={exhibition.id} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {modalOpen ? (
        <FilterModal
          activeTab={modalTab}
          filters={filters}
          onActiveTabChange={setModalTab}
          onApply={() => setModalOpen(false)}
          onClose={() => setModalOpen(false)}
          onFilterChange={updateFilter}
          onResetAndApply={() => {
            resetFilters();
            setModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
