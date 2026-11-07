import { type FormEvent, type MouseEvent, useMemo } from 'react';

import { X } from 'lucide-react';

import searchIcon from '@/assets/icons/SearchIcon.svg';
import { ErrorView, LoadingView } from '@/components/common';
import {
  EXPLORE_VIEW_OPTIONS,
  ExploreFieldTabs,
  FIELD_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  useExploreFilters,
  useExploreLike,
} from '@/components/explore';
import { Dropdown, PosterCard, SegmentToggle } from '@/components/ui';
import { useInfiniteSearchDisplays } from '@/hooks/queries/useDisplayBrowse';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { formatDate } from '@/utils/date';
import { getErrorMessage } from '@/utils/error';

export function ExplorePage() {
  const { field, type, status, sort, view, searchWord, selectOption, setView, submitSearch } =
    useExploreFilters();
  const like = useExploreLike();

  const isExhibitionView = view === 'exhibition';

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteSearchDisplays({
    searchWord: searchWord || null,
    field: field.value,
    type: type.value,
    status: status.value,
    size: 20,
  });

  const exhibitions = useMemo(() => data?.pages.flatMap((page) => page.exhibitions) ?? [], [data]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    submitSearch(String(formData.get('q') ?? ''));
    // 모바일에서 검색 후 키보드를 내린다
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const handleSearchClear = (event: MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget.form?.elements.namedItem('q');
    if (input instanceof HTMLInputElement) input.value = '';
    submitSearch('');
  };

  const triggerRef = useInfiniteScroll({
    hasNextPage: isExhibitionView && hasNextPage && !isError,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-primary-white">
      <header className="sticky top-0 z-20 flex flex-col gap-3.75 bg-primary-white px-5 pt-5 shadow-card">
        <form
          className="flex items-center justify-between gap-2 rounded-circle bg-tertiary px-5.5 py-4"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          {/* 확정된 검색어가 바뀌면(뒤로가기 등) 입력값을 다시 맞추기 위해 key로 리셋한다 */}
          <input
            aria-label="전시 검색어"
            className="peer typography-body-xl-regular min-w-0 flex-1 bg-transparent text-primary placeholder:text-tertiary focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
            defaultValue={searchWord}
            enterKeyHint="search"
            key={searchWord}
            name="q"
            placeholder="어떤 전시를 찾고 있나요?"
            type="search"
          />
          <button
            aria-label="검색어 지우기"
            className="shrink-0 cursor-pointer text-icon-tertiary peer-placeholder-shown:hidden"
            onClick={handleSearchClear}
            type="button"
          >
            <X aria-hidden="true" className="size-4.5" strokeWidth={2} />
          </button>
          <button aria-label="검색" className="shrink-0 cursor-pointer" type="submit">
            <img alt="" className="size-5" src={searchIcon} />
          </button>
        </form>

        <ExploreFieldTabs
          onSelect={(option) => selectOption('field', option)}
          options={FIELD_OPTIONS}
          selectedLabel={field.label}
        />
      </header>

      <section className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dropdown
              onSelect={(option) => selectOption('type', option)}
              options={TYPE_OPTIONS}
              placeholder="전시 유형"
              selectedLabel={type.label}
            />
            <Dropdown
              onSelect={(option) => selectOption('status', option)}
              options={STATUS_OPTIONS}
              placeholder="전시 상태"
              selectedLabel={status.label}
            />
          </div>
          <SegmentToggle onChange={setView} options={EXPLORE_VIEW_OPTIONS} value={view} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="typography-body-xl-semibold text-primary">
            {isExhibitionView ? '전시' : '작품'}
          </h2>
          <Dropdown
            onSelect={(option) => selectOption('sort', option)}
            options={SORT_OPTIONS}
            placeholder="정렬"
            selectedLabel={sort.label}
            variant="plain"
          />
        </div>

        {!isExhibitionView ? (
          <p className="typography-body-lg-regular pt-36 text-center text-tertiary">
            작품 검색은 준비 중이에요.
          </p>
        ) : isLoading ? (
          <LoadingView fullScreen={false} message="전시를 검색하는 중..." />
        ) : isError && exhibitions.length === 0 ? (
          <ErrorView
            fullScreen={false}
            message={getErrorMessage(error, '전시를 검색하지 못했어요.')}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : exhibitions.length === 0 ? (
          <p className="typography-body-lg-regular pt-36 text-center text-tertiary">
            검색 결과가 없어요.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
              {exhibitions.map((exhibition) => (
                <li key={exhibition.displayId}>
                  <PosterCard
                    imageUrl={exhibition.posterImageUrl}
                    isLikePending={like.isPendingFor(exhibition.displayId)}
                    likeCount={exhibition.likeCount}
                    liked={exhibition.isLiked}
                    onLikeClick={() =>
                      like.toggle(exhibition.displayId, Boolean(exhibition.isLiked))
                    }
                    period={`${formatDate(exhibition.startedAt)} - ${formatDate(exhibition.endedAt)}`}
                    subtitle={exhibition.schoolDepartmentName}
                    title={exhibition.title}
                    to={`/display/${exhibition.displayId}`}
                    variant="exhibition"
                  />
                </li>
              ))}
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
        )}
      </section>
      {like.loginModal}
    </div>
  );
}
