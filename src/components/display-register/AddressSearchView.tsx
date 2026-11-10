import { type FormEvent, useId, useState } from 'react';

import type { AddressSearchResultDto } from '@/api/dto';
import SearchIcon from '@/assets/display-register/SearchIcon.svg';
import { Skeleton, SkeletonList } from '@/components/ui';
import { useAddressSearch } from '@/hooks/queries/useAddressSearch';
import { cn } from '@/utils/cn';

const EXAMPLES = [
  { label: '도로명 + 건물번호', value: '남대문로 9길 40' },
  { label: '지역명(동/리) + 번지', value: '중구 다동 155' },
  { label: '지역명(동/리) + 건물명', value: '분당 주공' },
];
const TAG_CLASS =
  'typography-body-sm-semibold inline-flex h-5 shrink-0 items-center rounded-4 px-1.5';

function AddressExamples() {
  return (
    <div className="flex flex-col gap-3 rounded-12 bg-secondary p-4">
      <p className="typography-body-md-medium text-secondary">입력 예시</p>
      <dl className="flex flex-col gap-3">
        {EXAMPLES.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="typography-body-md-medium text-secondary">{label}</dt>
            <dd className="typography-body-lg-medium text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AddressResultItem({
  result,
  onSelect,
}: {
  result: AddressSearchResultDto;
  onSelect: () => void;
}) {
  return (
    <li className="border-b border-primary">
      <button
        type="button"
        onClick={onSelect}
        className="group flex w-full flex-col gap-2 py-4 text-left transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      >
        {result.zipCode && (
          <span className="typography-body-md-semibold text-secondary">{result.zipCode}</span>
        )}
        {result.roadAddress && (
          <span className="flex items-start gap-2">
            <span className={cn(TAG_CLASS, 'bg-info-subtle text-info')}>도로명</span>
            <span className="typography-body-lg-medium break-keep text-primary group-hover:underline group-hover:underline-offset-3">
              {result.roadAddress} {result.roadAddressDetail}
            </span>
          </span>
        )}
        <span className="flex items-start gap-2">
          <span className={cn(TAG_CLASS, 'bg-tertiary text-secondary')}>지번</span>
          <span className="typography-body-lg-medium break-keep text-secondary">
            {result.jibunAddress}
          </span>
        </span>
      </button>
    </li>
  );
}

export function AddressSearchView({
  onSelect,
}: {
  onSelect: (result: AddressSearchResultDto) => void;
}) {
  const inputId = useId();
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const { data: results, isPending, isError, refetch } = useAddressSearch(query);
  const hasQuery = query.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(keyword.trim());
  };

  const renderBody = () => {
    if (!hasQuery) return <AddressExamples />;

    if (isPending) {
      return (
        <div aria-busy="true" className="flex flex-col gap-4">
          <SkeletonList count={3}>
            {() => <Skeleton className="h-24 w-full rounded-8" />}
          </SkeletonList>
        </div>
      );
    }

    if (isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex flex-col gap-1">
            <p className="typography-body-xl-semibold text-primary">주소를 불러오지 못했어요</p>
            <p className="typography-body-lg-regular text-tertiary">
              네트워크 상태를 확인하고 다시 시도해주세요
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="typography-body-md-semibold h-11 rounded-8 border border-primary bg-primary-white px-4 text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col gap-6">
          <div role="status" className="flex flex-col gap-1 pt-6 text-center">
            <p className="typography-body-xl-semibold text-primary">검색 결과가 없어요</p>
            <p className="typography-body-lg-regular text-tertiary">
              아래 입력 예시를 참고해 다시 검색해보세요
            </p>
          </div>
          <AddressExamples />
        </div>
      );
    }

    return (
      <section aria-labelledby={`${inputId}-results`} className="flex flex-col">
        <h3 id={`${inputId}-results`} className="typography-body-lg-semibold text-primary">
          &lsquo;{query}&rsquo; 검색 결과
        </h3>
        <ul>
          {results.map((result) => (
            <AddressResultItem key={result.id} result={result} onSelect={() => onSelect(result)} />
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-5 pt-2 pb-10">
      <div className="flex flex-col gap-3">
        <h2 className="typography-body-xl-semibold text-primary">주소를 검색해주세요</h2>
        <form role="search" onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label htmlFor={inputId} className="typography-body-lg-semibold text-primary">
            주소
          </label>
          <div className="flex items-center gap-2 border-b border-primary transition duration-fast ease-standard focus-within:border-interactive-primary">
            <input
              id={inputId}
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="주소 검색"
              autoComplete="off"
              enterKeyHint="search"
              // 사용자가 주소 검색을 눌러 들어온 화면이라 바로 입력할 수 있게 한다
              autoFocus
              className="typography-body-xl-regular min-w-0 flex-1 bg-transparent py-3 text-primary outline-none placeholder:text-tertiary [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="submit"
              aria-label="검색"
              className="-mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={SearchIcon} alt="" />
            </button>
          </div>
        </form>
      </div>
      {renderBody()}
    </div>
  );
}
