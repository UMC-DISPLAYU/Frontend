import { useMemo, useState } from 'react';

import chevronDownIcon from '../assets/chevron-down.svg';
import filterIcon from '../assets/filter.svg';
import searchIcon from '../assets/search.svg';
import {
  ExhibitionCard,
  EXHIBITIONS,
  FilterPanel,
  type RegionFilterValue,
  type StatusFilterValue,
} from '../components/search';

type ExploreTab = 'list' | 'map';

function toggleSetValue(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ExploreTab>('list');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilterValue>('all');
  const [fieldFilters, setFieldFilters] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());

  const filteredExhibitions = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return EXHIBITIONS;
    return EXHIBITIONS.filter((exhibition) => exhibition.title.includes(keyword));
  }, [query]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => toggleSetValue(prev, id));
  };

  return (
    <div className="mx-auto flex w-full min-w-[320px] max-w-[402px] flex-col bg-neutral-100">
      <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 pt-4">
        <h1 className="text-xl font-bold text-neutral-900">탐색</h1>

        <div className="flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-neutral-100 px-3.5">
          <img alt="" className="size-3.5" src={searchIcon} />
          <input
            className="h-5 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="전시명을 검색해보세요"
            type="text"
            value={query}
          />
        </div>

        <div className="flex h-8 border-b border-gray-200">
          <button
            className={`flex items-center px-0 pr-5 pb-2.5 text-sm ${
              activeTab === 'list'
                ? 'border-b-2 border-neutral-900 font-normal text-neutral-900'
                : 'font-medium text-gray-400'
            }`}
            onClick={() => setActiveTab('list')}
            type="button"
          >
            전시 목록
          </button>
          <button
            className={`flex items-center px-0 pb-2.5 text-sm ${
              activeTab === 'map'
                ? 'border-b-2 border-neutral-900 font-normal text-neutral-900'
                : 'font-medium text-gray-400'
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
          <button
            className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5"
            onClick={() => setFilterOpen((prev) => !prev)}
            type="button"
          >
            <span className="flex items-center gap-1.5 text-xs text-gray-700">
              <img alt="" className="size-3.5" src={filterIcon} />
              필터
            </span>
            <img
              alt=""
              className={`size-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
              src={chevronDownIcon}
            />
          </button>

          {filterOpen ? (
            <FilterPanel
              fields={fieldFilters}
              onFieldToggle={(value) => setFieldFilters((prev) => toggleSetValue(prev, value))}
              onRegionChange={setRegionFilter}
              onStatusChange={setStatusFilter}
              onTypeToggle={(value) => setTypeFilters((prev) => toggleSetValue(prev, value))}
              region={regionFilter}
              status={statusFilter}
              types={typeFilters}
            />
          ) : null}

          <div className="flex flex-col gap-2.5 px-4 pt-4 pb-24">
            {filteredExhibitions.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">검색 결과가 없어요</p>
            ) : (
              filteredExhibitions.map((exhibition) => (
                <ExhibitionCard
                  bookmarked={bookmarkedIds.has(exhibition.id)}
                  exhibition={exhibition}
                  key={exhibition.id}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
