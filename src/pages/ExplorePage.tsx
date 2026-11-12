import { ErrorView } from '@/components/common';
import {
  ExploreExhibitionCard,
  ExploreExhibitionCardSkeleton,
  ExploreFieldTabs,
  ExploreFilterMenu,
  ExploreSearchBar,
  ExploreViewToggle,
  FIELD_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  useExploreFilters,
} from '@/components/explore';
import { PageContainer } from '@/components/layout';
import { SkeletonList } from '@/components/ui';
import { useInfiniteSearchDisplays } from '@/hooks/queries/useDisplayBrowse';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

const PAGE_SIZE = 20;
const RESULTS_ID = 'explore-results';
const fieldTabId = (index: number) => `explore-field-${index}`;

const GRID_CLASS =
  'mt-4 grid grid-cols-2 gap-x-3 gap-y-6 tablet:grid-cols-3 desktop:grid-cols-4 min-[80rem]:grid-cols-5';

function ExploreEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mt-12 flex h-90 flex-col items-center justify-center gap-2 text-center">
      <strong className="typography-body-xl-semibold text-primary">{title}</strong>
      {description ? (
        <p className="typography-body-md-medium text-secondary">{description}</p>
      ) : null}
    </div>
  );
}

export function ExplorePage() {
  const { field, type, status, sort, view, searchWord, selectOption, setView, submitSearch } =
    useExploreFilters();

  const isExhibitionView = view === 'exhibition';

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteSearchDisplays({
    searchWord: searchWord || null,
    field: field.value,
    type: type.value,
    status: status.value,
    size: PAGE_SIZE,
  });

  const pages = data?.pages ?? [];
  const hasExhibitions = pages.some((page) => page.exhibitions.length > 0);

  const triggerRef = useInfiniteScroll({
    hasNextPage: isExhibitionView && hasNextPage && !isError,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '0px 0px 400px 0px',
  });

  const renderResults = () => {
    if (!isExhibitionView) return <ExploreEmpty title="작품 검색은 준비 중이에요" />;

    if (isPending) {
      return (
        <ul aria-busy="true" aria-label="전시를 불러오는 중" className={GRID_CLASS}>
          <SkeletonList count={6}>
            {() => (
              <li aria-hidden="true">
                <ExploreExhibitionCardSkeleton />
              </li>
            )}
          </SkeletonList>
        </ul>
      );
    }

    if (isError && !hasExhibitions) {
      return (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, '전시를 검색하지 못했어요.')}
          onRetry={() => {
            void refetch();
          }}
        />
      );
    }

    if (!hasExhibitions) {
      return (
        <ExploreEmpty description="다른 검색어나 필터로 찾아보세요" title="검색 결과가 없어요" />
      );
    }

    return (
      <>
        <ul className={GRID_CLASS}>
          {pages.map((page) =>
            page.exhibitions.map((exhibition, index) => (
              <li className="animate-rise" key={exhibition.displayId} style={staggerStyle(index)}>
                <ExploreExhibitionCard exhibition={exhibition} />
              </li>
            )),
          )}
        </ul>
        {isError ? (
          <ErrorView
            fullScreen={false}
            message={getErrorMessage(error, '전시를 더 불러오지 못했어요.')}
            onRetry={() => {
              void (isFetchNextPageError ? fetchNextPage() : refetch());
            }}
          />
        ) : null}
        <div aria-hidden="true" className="h-1" ref={triggerRef} />
      </>
    );
  };

  return (
    // Layout 이 냅바 자리로 main 에 준 아래 여백을 걷어내고, 프로토타입 하단 여백(150px)을 직접 둔다
    <div className="-mb-navbar-clearance min-h-dvh bg-primary-white pb-37.5">
      <PageContainer variant="list">
        <h1 className="sr-only">탐색</h1>
        <ExploreSearchBar onSearch={submitSearch} searchWord={searchWord} />

        <ExploreFieldTabs
          onSelect={(option) => selectOption('field', option)}
          options={FIELD_OPTIONS}
          panelId={RESULTS_ID}
          selectedLabel={field.label}
          tabId={fieldTabId}
        />

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
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

        <div className="mt-4 flex h-6 items-center">
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
          {renderResults()}
        </section>
      </PageContainer>
    </div>
  );
}
