import {
  EXPLORE_WRAP_CLASS,
  ExploreArtworkCard,
  ExploreArtworkCardSkeleton,
  ExploreExhibitionCard,
  ExploreExhibitionCardSkeleton,
  ExploreFieldTabs,
  ExploreFilterMenu,
  ExploreResultGrid,
  ExploreSearchBar,
  ExploreViewToggle,
  FIELD_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  useExploreFilters,
  useSearchResultCount,
} from '@/components/explore';
import { useInfiniteSearchArtworks } from '@/hooks/queries/useArtworkSearch';
import { useInfiniteSearchDisplays } from '@/hooks/queries/useDisplayBrowse';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 20;
const RESULTS_ID = 'explore-results';
const fieldTabId = (index: number) => `explore-field-${index}`;

export function ExplorePage() {
  const { field, type, status, sort, view, searchWord, selectOption, setView, submitSearch } =
    useExploreFilters();

  const isExhibitionView = view === 'exhibition';
  // 전시 ↔ 작품을 오가도 검색어 · 분야 · 필터 · 정렬은 그대로 둔다(탐색 정책)
  const searchParams = {
    searchWord: searchWord || null,
    field: field.value,
    type: type.value,
    status: status.value,
    sort: sort.value,
    size: PAGE_SIZE,
  };

  const exhibitionQuery = useInfiniteSearchDisplays({
    ...searchParams,
    enabled: isExhibitionView,
  });
  const artworkQuery = useInfiniteSearchArtworks({ ...searchParams, enabled: !isExhibitionView });

  const exhibitionPages = exhibitionQuery.data?.pages.map((page) => page.exhibitions) ?? [];
  const artworkPages = artworkQuery.data?.pages.map((page) => page.artworks) ?? [];

  const activeQuery = isExhibitionView ? exhibitionQuery : artworkQuery;
  const activePages = isExhibitionView ? exhibitionPages : artworkPages;
  const { fetchNextPage, hasNextPage, isError, isFetchingNextPage, isPlaceholderData } =
    activeQuery;

  const resultCount = useSearchResultCount({
    active: searchWord.length > 0,
    pageItemCounts: activePages.map((page) => page.length),
    hasNextPage,
    isFetchingNextPage,
    isError,
    isPlaceholderData,
    fetchNextPage,
  });

  const triggerRef = useInfiniteScroll({
    hasNextPage: hasNextPage && !isError,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '0px 0px 400px 0px',
  });

  const queryState = {
    isPending: activeQuery.isPending,
    isError,
    isFetchNextPageError: activeQuery.isFetchNextPageError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    fetchNextPage,
    triggerRef,
  };

  return (
    // Layout 이 냅바 자리로 main 에 준 아래 여백을 걷어내고, 프로토타입 하단 여백(150px)을 직접 둔다
    <div className="typography-body-md-medium -mb-navbar-clearance min-h-dvh bg-[#fff] pb-37.5 text-[#18181b]">
      <header className={cn(EXPLORE_WRAP_CLASS, 'pt-[max(12px,env(safe-area-inset-top))]')}>
        <h1 className="sr-only">탐색</h1>
        <ExploreSearchBar onSearch={submitSearch} searchWord={searchWord} />
      </header>

      <div className={EXPLORE_WRAP_CLASS}>
        <ExploreFieldTabs
          onSelect={(option) => selectOption('field', option)}
          options={FIELD_OPTIONS}
          panelId={RESULTS_ID}
          selectedLabel={field.label}
          tabId={fieldTabId}
        />

        <div className="mt-3.5 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <ExploreFilterMenu
              label="전시 유형"
              onSelect={(option) => selectOption('type', option)}
              options={TYPE_OPTIONS}
              selectedLabel={type.label}
              variant="chip"
            />
            <ExploreFilterMenu
              label="전시 상태"
              onSelect={(option) => selectOption('status', option)}
              options={STATUS_OPTIONS}
              selectedLabel={status.label}
              variant="chip"
            />
          </div>
          <ExploreViewToggle onChange={setView} value={view} />
        </div>

        <div className="mt-3 flex min-h-7 items-center justify-between">
          <p aria-live="polite" className="typography-body-lg-semibold tabular-nums">
            {resultCount === null ? '' : `${isExhibitionView ? '전시' : '작품'} ${resultCount}개`}
          </p>
          <ExploreFilterMenu
            label="정렬"
            onSelect={(option) => selectOption('sort', option)}
            options={SORT_OPTIONS}
            selectedLabel={sort.label}
            variant="sort"
          />
        </div>

        <section
          aria-labelledby={fieldTabId(FIELD_OPTIONS.indexOf(field))}
          id={RESULTS_ID}
          role="tabpanel"
        >
          {isExhibitionView ? (
            <ExploreResultGrid
              getKey={(exhibition) => exhibition.displayId}
              itemObject="전시를"
              pages={exhibitionPages}
              renderItem={(exhibition) => <ExploreExhibitionCard exhibition={exhibition} />}
              renderSkeleton={() => <ExploreExhibitionCardSkeleton />}
              {...queryState}
            />
          ) : (
            <ExploreResultGrid
              getKey={(artwork) => artwork.artworkId}
              itemObject="작품을"
              pages={artworkPages}
              renderItem={(artwork) => <ExploreArtworkCard artwork={artwork} />}
              renderSkeleton={() => <ExploreArtworkCardSkeleton />}
              {...queryState}
            />
          )}
        </section>
      </div>
    </div>
  );
}
