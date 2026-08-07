import { useEffect, useMemo, useState } from 'react';

import { Search, X } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';

import type { SearchDisplaysRequestDto } from '@/api/dto';
import filterIcon from '@/assets/search/filter.svg';
import filterSelectedDotIcon from '@/assets/search/filter-selected-dot.svg';
import { LoadingView } from '@/components/common';
import { getFilterOptionValues } from '@/components/search/filter/filterOptions';

import {
  DEFAULT_FILTER_STATE,
  ExhibitionCard,
  ExhibitionMap,
  ExhibitionMapCard,
  FIELD_OPTIONS,
  FILTER_CONFIG,
  FilterChip,
  FilterModal,
  type FilterState,
  type FilterTab,
} from '../components/search';
import { useSearchDisplays } from '../hooks/queries/useDisplayBrowse';
import { type NearbyParams, useNearbyDisplays } from '../hooks/useNearbyDisplays';

type ExploreTab = 'list' | 'map';

const createSearchDisplayParams = (query: string, filters: FilterState) => {
  const params: SearchDisplaysRequestDto = {
    cursor: 0,
    searchWord: query.trim() || null,
    size: 20,
  };

  (Object.entries(filters) as Array<[FilterTab, string[]]>).forEach(([tab, labels]) => {
    const config = FILTER_CONFIG[tab];
    params[config.param] = getFilterOptionValues(config, labels);
  });

  return params;
};

export function SearchPage() {
  const location = useLocation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const paramTab = urlSearchParams.get('tab');
  const paramType = urlSearchParams.get('type');
  const paramStatus = urlSearchParams.get('status');

  const [query, setQuery] = useState('');
  const activeTab: ExploreTab = paramTab === 'map' ? 'map' : 'list';
  const [selectedMapId, setSelectedMapIdState] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('SEARCH_SELECTED_MAP_ID');
    return saved ? Number(saved) : null;
  });
  const [nearbyParams, setNearbyParams] = useState<NearbyParams | null>(null);

  const setSelectedMapId = (id: number | null) => {
    setSelectedMapIdState(id);
    if (id !== null) {
      sessionStorage.setItem('SEARCH_SELECTED_MAP_ID', String(id));
    } else {
      sessionStorage.removeItem('SEARCH_SELECTED_MAP_ID');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('SEARCH_PAGE_SCROLL_Y', String(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedY = sessionStorage.getItem('SEARCH_PAGE_SCROLL_Y');
    if (savedY) {
      setTimeout(() => {
        window.scrollTo(0, Number(savedY));
      }, 50);
    }
  }, [activeTab]);

  const handleTabChange = (tab: ExploreTab) => {
    setUrlSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'map') {
          next.set('tab', 'map');
        } else {
          next.delete('tab');
        }
        return next;
      },
      { replace: true },
    );
  };

  const stateFilters = (location.state as { filters?: Partial<FilterState> })?.filters;
  const targetFiltersKey = `${paramType ?? ''}_${paramStatus ?? ''}_${JSON.stringify(stateFilters ?? {})}`;

  const [prevKey, setPrevKey] = useState(targetFiltersKey);
  const [filters, setFilters] = useState<FilterState>(() => {
    const base: FilterState = { ...DEFAULT_FILTER_STATE };
    if (stateFilters) return { ...base, ...stateFilters };
    if (paramType) base['전시유형'] = [paramType];
    if (paramStatus) base['전시상태'] = [paramStatus];
    return base;
  });

  if (prevKey !== targetFiltersKey) {
    setPrevKey(targetFiltersKey);
    const base: FilterState = { ...DEFAULT_FILTER_STATE };
    if (stateFilters) {
      setFilters({ ...base, ...stateFilters });
    } else {
      if (paramType) base['전시유형'] = [paramType];
      if (paramStatus) base['전시상태'] = [paramStatus];
      setFilters(base);
    }
  }

  const [modalOpen, setModalOpen] = useState(false);

  const searchDisplayParams = useMemo(
    () => createSearchDisplayParams(query, filters),
    [query, filters],
  );

  const { data, isError, isLoading } = useSearchDisplays(searchDisplayParams);
  const exhibitions = data?.exhibitions ?? [];

  const nearbyParamsWithSearch = useMemo(
    () => (nearbyParams ? { ...nearbyParams, searchWord: query.trim() || null } : null),
    [nearbyParams, query],
  );
  const { data: nearbyData } = useNearbyDisplays(nearbyParamsWithSearch);
  const nearbyExhibitions = nearbyData ?? [];

  const activeFilterEntries = (Object.entries(filters) as Array<[FilterTab, string[]]>).flatMap(
    ([tab, values]) => (values ?? []).map((val) => ({ tab, value: val })),
  );

  const updateFilter = (tab: FilterTab, value: string) => {
    setFilters((prev) => {
      const current = prev[tab] ?? [];
      if (value === '전체') {
        return { ...prev, [tab]: [] };
      }
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [tab]: updated };
    });
  };

  const resetFilters = () => setFilters(DEFAULT_FILTER_STATE);

  return (
    <div className="mx-auto flex min-h-dvh w-full min-w-[320px] max-w-md flex-col bg-page">
      <div className="flex flex-col bg-page px-5 pt-5">
        <div className="flex h-15.5 flex-col justify-start gap-1 self-stretch">
          <h1 className="typo-heading-3xl text-logo">Explore</h1>
          <p className="typo-body-xs-regular text-hint">
            저장한 전시와 작품, 작가를 다시 꺼내보세요.
          </p>
        </div>

        <div className="mt-2.5 flex h-10 items-center justify-between rounded-xl bg-box px-5 py-2.5 shadow-[inset_1px_1px_1px_0px_rgba(0,0,0,0.14),inset_-1px_-1px_1px_0px_rgba(255,255,255,1.00)] mb-3">
          <input
            className="typo-body-sm-regular h-5 flex-1 bg-transparent placeholder:text-faint focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            type="text"
            value={query}
          />
          <Search aria-hidden="true" className="text-hint" size={18} strokeWidth={2} />
        </div>
      </div>

      <div className="sticky top-0 z-20 flex flex-col bg-page">
        <div className="flex h-11 items-end gap-3.5 border-b border-line-soft px-5">
          <button
            className={`border-b-2 px-0 pb-3 cursor-pointer ${
              activeTab === 'list'
                ? 'typo-body-sm-bold border-main text-main'
                : 'typo-body-sm-regular border-transparent text-faint'
            }`}
            onClick={() => handleTabChange('list')}
            type="button"
          >
            전시목록
          </button>
          <button
            className={`border-b-2 px-0 pb-3 cursor-pointer ${
              activeTab === 'map'
                ? 'typo-body-sm-bold border-main text-main'
                : 'typo-body-sm-regular border-transparent text-faint'
            }`}
            onClick={() => handleTabChange('map')}
            type="button"
          >
            지도
          </button>
        </div>

        {activeTab === 'map' ? (
          <div className="h-75 w-full border-b border-line-soft">
            <ExhibitionMap
              exhibitions={nearbyExhibitions}
              onBoundsChange={setNearbyParams}
              onSelect={setSelectedMapId}
              selectedId={selectedMapId}
            />
          </div>
        ) : null}
      </div>

      {activeTab === 'list' ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5 px-5 pt-3.5">
            <button
              aria-label="필터"
              className="relative flex size-7 shrink-0 items-center justify-center rounded-sm outline outline-1 -outline-offset-1 outline-stone-300"
              onClick={() => setModalOpen(true)}
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
                  selected={(filters['전시분야'] ?? []).includes(field)}
                />
              ))}
            </div>
          </div>

          {activeFilterEntries.length > 0 ? (
            <div className="flex items-center justify-between px-5 pt-2.5">
              <div className="flex flex-wrap gap-2.5">
                {activeFilterEntries.map(({ tab, value }) => (
                  <button
                    className="flex shrink-0 items-center gap-1 typo-body-xs-regular text-sub700 hover:text-main cursor-pointer"
                    key={`${tab}-${value}`}
                    onClick={() => updateFilter(tab, value)}
                    type="button"
                  >
                    {value} <X size={12} />
                  </button>
                ))}
              </div>
              <button
                className="shrink-0 typo-body-xs-regular text-sub700 underline cursor-pointer"
                onClick={resetFilters}
                type="button"
              >
                초기화
              </button>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col px-5 pt-4 pb-24">
            {isLoading ? (
              <LoadingView fullScreen={false} message="전시를 검색하는 중..." />
            ) : isError || exhibitions.length === 0 ? (
              <div className="flex flex-1 justify-center pt-36 text-center">
                <p className="typo-body-xl-regular text-faint">결과가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
                {exhibitions.map((exhibition) => (
                  <ExhibitionCard exhibition={exhibition} key={exhibition.displayId} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 px-5 pt-4 pb-24">
          {nearbyExhibitions.length === 0 ? (
            <p className="flex items-center justify-center py-8 text-center text-sm text-neutral-400">
              이 지역에 전시가 없습니다
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(selectedMapId
                ? nearbyExhibitions.filter((ex) => ex.displayId === selectedMapId)
                : nearbyExhibitions
              ).map((exhibition) => (
                <ExhibitionMapCard
                  exhibition={exhibition}
                  key={exhibition.displayId}
                  onClick={() => setSelectedMapId(exhibition.displayId)}
                  selected={selectedMapId === exhibition.displayId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {modalOpen ? (
        <FilterModal
          filters={filters}
          onApply={() => setModalOpen(false)}
          onClose={() => setModalOpen(false)}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          onResetAndApply={() => {
            resetFilters();
            setModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
