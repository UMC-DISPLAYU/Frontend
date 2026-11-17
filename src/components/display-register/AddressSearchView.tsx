import { type FormEvent, useId, useState } from 'react';

import type { AddressSearchResultDto } from '@/api/dto';
import { SkeletonList, SkeletonText } from '@/components/ui';
import { useAddressSearch } from '@/hooks/queries/useAddressSearch';
import { useSkeleton } from '@/hooks/useSkeleton';
import { cn } from '@/utils/cn';

import { FOCUS_CLASS } from './displayRegister.styles';
import { SearchIcon } from './DisplayRegisterIcons';

const EXAMPLES = [
  { label: '도로명 + 건물번호', value: '남대문로 9길 40' },
  { label: '지역명(동/리) + 번지', value: '중구 다동 155' },
  { label: '지역명(동/리) + 건물명', value: '분당 주공' },
];
const TAG_CLASS =
  'typography-body-sm-semibold inline-flex h-5 shrink-0 items-center rounded-4 px-1.5';
const HEADING_CLASS = 'typography-body-lg-semibold text-primary';

function AddressExamples() {
  return (
    <>
      <h3 className={cn(HEADING_CLASS, 'mt-5')}>입력 예시</h3>
      <dl className="typography-body-lg-medium mt-3 grid gap-3.5">
        {EXAMPLES.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-semibold text-secondary">{label}</dt>
            <dd className="text-tertiary">{value}</dd>
          </div>
        ))}
      </dl>
    </>
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
    <li className="border-b border-bg-tertiary">
      <button
        type="button"
        onClick={onSelect}
        className={cn('typography-body-lg-medium group block w-full py-4 text-left', FOCUS_CLASS)}
      >
        {result.zipCode && (
          <span className="typography-body-md-semibold text-secondary">{result.zipCode}</span>
        )}
        {result.roadAddress && (
          <span className="typography-body-lg-medium mt-2 flex items-baseline gap-2 text-primary">
            <span className={cn(TAG_CLASS, 'bg-[#e3efff] text-[#2563eb]')}>도로명</span>
            <span className="break-keep group-hover:underline group-hover:underline-offset-3">
              {result.roadAddress} {result.roadAddressDetail}
            </span>
          </span>
        )}
        <span className="typography-body-lg-medium mt-1.5 flex items-baseline gap-2 text-tertiary">
          <span className={cn(TAG_CLASS, 'bg-[#f0f0f3] text-secondary')}>지번</span>
          <span className="break-keep">{result.jibunAddress}</span>
        </span>
      </button>
    </li>
  );
}

/** 프로토타입 주소 검색 화면(같은 페이지 안에서 2/2 입력 화면 대신 보인다) */
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
  // 검색어가 없으면 쿼리가 꺼져 있어 isPending 이 계속 true 다
  const { showSkeleton } = useSkeleton(hasQuery && isPending);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(keyword.trim());
  };

  const renderBody = () => {
    if (!hasQuery) return <AddressExamples />;

    // isPending 도 함께 봐야 아래에서 results 가 있는 것으로 좁혀진다
    if (showSkeleton || isPending) {
      return (
        <ul aria-busy="true" className="mt-6">
          <SkeletonList count={3}>
            {() => (
              <li className="flex flex-col gap-2 border-b border-primary py-4">
                <SkeletonText className="typography-body-md-semibold w-12" />
                <SkeletonText className="typography-body-lg-medium w-3/4" />
                <SkeletonText className="typography-body-lg-medium w-2/3" />
              </li>
            )}
          </SkeletonList>
        </ul>
      );
    }

    if (isError) {
      return (
        <div role="alert" className="typography-body-lg-medium mt-8">
          <b className="typography-body-xl-semibold block text-primary">주소를 불러오지 못했어요</b>
          <p className="mt-1 text-tertiary">네트워크 상태를 확인하고 다시 검색해주세요</p>
          <button
            type="button"
            onClick={() => refetch()}
            className={cn(
              'typography-body-md-semibold mt-3 h-8 rounded-8 bg-[#f0f0f3] px-3 text-primary',
              FOCUS_CLASS,
            )}
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <>
          <div role="status" className="typography-body-lg-medium mt-8">
            <b className="typography-body-xl-semibold block text-primary">검색 결과가 없어요</b>
            <p className="mt-1 text-tertiary">아래 입력 예시를 참고해 다시 검색해보세요</p>
          </div>
          <AddressExamples />
        </>
      );
    }

    return (
      <section aria-labelledby={`${inputId}-results`}>
        <h3 id={`${inputId}-results`} className={cn(HEADING_CLASS, 'mt-6')}>
          &lsquo;{query}&rsquo; 검색 결과
        </h3>
        <ul className="mt-2">
          {results.map((result) => (
            <AddressResultItem key={result.id} result={result} onSelect={() => onSelect(result)} />
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="flex-1 pb-10">
      <form role="search" onSubmit={handleSubmit} className="mt-2">
        <label htmlFor={inputId} className="typography-body-lg-semibold flex text-primary">
          주소
        </label>
        <div className="flex h-12 items-center border-b border-primary transition-colors duration-fast focus-within:border-[#18181b]">
          <input
            id={inputId}
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="주소를 검색해주세요"
            autoComplete="off"
            enterKeyHint="search"
            // 사용자가 주소 검색을 눌러 들어온 화면이라 바로 입력할 수 있게 한다
            autoFocus
            className="typography-body-xl-regular h-full min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-tertiary [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            aria-label="검색"
            className={cn(
              '-mr-2 grid size-10 shrink-0 place-items-center text-primary',
              FOCUS_CLASS,
            )}
          >
            <SearchIcon className="size-5.5" />
          </button>
        </div>
      </form>
      {renderBody()}
    </div>
  );
}
