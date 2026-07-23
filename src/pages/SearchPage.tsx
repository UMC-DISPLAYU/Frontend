import { useMemo, useState } from 'react';

import type { SearchDisplaysRequestDto } from '@/api/dto';

import cancelIcon from '../assets/cancel.svg';
import filterIcon from '../assets/filter.svg';
import filterSelectedDotIcon from '../assets/filter-selected-dot.svg';
import searchIcon from '../assets/search.svg';
import {
  DEFAULT_FILTER_STATE,
  ExhibitionCard,
  FIELD_OPTIONS,
  FILTER_CONFIG,
  FilterChip,
  FilterModal,
  type FilterState,
  type FilterTab,
  getFilterOptionValue,
} from '../components/search';
import { useSearchDisplays } from '../hooks/queries/useDisplayBrowse';

type ExploreTab = 'list' | 'map';

const createSearchDisplayParams = (query: string, filters: FilterState) => {
  const params: SearchDisplaysRequestDto = {
    cursor: 0,
    searchWord: query.trim() || null,
    size: 20,
  };

  (Object.entries(filters) as Array<[FilterTab, string]>).forEach(([tab, label]) => {
    const config = FILTER_CONFIG[tab];
    params[config.param] = getFilterOptionValue(config, label);
  });

  return params;
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ExploreTab>('list');

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<FilterTab>('전시분야');

  const searchParams = useMemo(() => createSearchDisplayParams(query, filters), [query, filters]);

  const { data, isError, isLoading } = useSearchDisplays(searchParams);
  const exhibitions = data?.exhibitions ?? [];

  const activeFilterEntries = (Object.entries(filters) as Array<[FilterTab, string]>).filter(
    ([, value]) => value !== '전체',
  );

  const updateFilter = (tab: FilterTab, value: string) => {
    setFilters((prev) => ({ ...prev, [tab]: prev[tab] === value ? '전체' : value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTER_STATE);

  return (
    <div className="mx-auto flex min-h-dvh w-full min-w-[320px] max-w-[402px] flex-col bg-gray-100">
      <div className="flex flex-col bg-gray-100 px-5 pt-5">
        <div className="flex h-[62px] flex-col justify-start gap-1 self-stretch">
          <h1 className="text-slate-900 text-3xl font-['Aldrich'] leading-10">Explore</h1>
          <p className="text-xs text-neutral-500">저장한 전시와 작품, 작가를 다시 꺼내보세요.</p>
        </div>

        <div className="mt-2.5 flex h-10 items-center justify-between rounded-xl bg-gray-200 px-5 py-2.5 shadow-[inset_1px_1px_1px_0px_rgba(0,0,0,0.14),inset_-1px_-1px_1px_0px_rgba(255,255,255,1.00)]">
          <input
            className="h-5 flex-1 bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            type="text"
            value={query}
          />
          <img alt="" className="size-5" src={searchIcon} />
        </div>

        <div className="-mx-5 flex h-11 items-end gap-5 border-b border-zinc-300 px-5">
          <button
            className={`border-b-2 px-0 pb-3 text-sm ${
              activeTab === 'list'
                ? 'border-neutral-900 font-bold text-neutral-900'
                : 'border-transparent font-normal text-neutral-400'
            }`}
            onClick={() => setActiveTab('list')}
            type="button"
          >
            전시목록
          </button>
          <button
            className={`border-b-2 px-0 pb-3 text-sm ${
              activeTab === 'map'
                ? 'border-neutral-900 font-bold text-neutral-900'
                : 'border-transparent font-normal text-neutral-400'
            }`}
            onClick={() => setActiveTab('map')}
            type="button"
          >
            지도
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="flex flex-1 flex-col">
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
              {FIELD_OPTIONS.filter((field) => field !== '전체').map((field) => (
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

          <div className="flex flex-1 flex-col px-5 pt-4 pb-24">
            {isLoading ? (
              <p className="flex flex-1 items-center justify-center text-center text-xl text-neutral-400">
                불러오는 중...
              </p>
            ) : isError ? (
              <p className="flex flex-1 items-center justify-center text-center text-xl text-neutral-400">
                전시를 불러오지 못했습니다
              </p>
            ) : exhibitions.length === 0 ? (
              <p className="flex flex-1 items-center justify-center text-center text-xl text-neutral-400">
                결과가 없습니다
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
                {exhibitions.map((exhibition) => (
                  <ExhibitionCard exhibition={exhibition} key={exhibition.displayId} />
                ))}
              </div>
            )}
          </div>
        </div>
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
