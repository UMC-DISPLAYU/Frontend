import { type FormEvent, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { ExploreCloseIcon, ExploreSearchIcon } from './ExploreIcons';

// 입력을 멈추면 바로 검색한다. 글자마다 요청이 나가지 않게 잠깐 기다린다
const SEARCH_DEBOUNCE_MS = 300;

type ExploreSearchBarProps = {
  searchWord: string;
  onSearch: (word: string) => void;
};

export function ExploreSearchBar({ searchWord, onSearch }: ExploreSearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(searchWord);
  const [appliedWord, setAppliedWord] = useState(searchWord);

  // 뒤로가기 · 다른 화면의 링크로 검색어가 바뀌면 입력값도 맞춘다(입력 중인 값이 반영된 경우는 그대로 둔다)
  if (appliedWord !== searchWord) {
    setAppliedWord(searchWord);
    if (draft.trim() !== searchWord) setDraft(searchWord);
  }

  useEffect(() => {
    const word = draft.trim();
    if (word === searchWord) return;
    const timer = window.setTimeout(() => onSearch(word), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, searchWord, onSearch]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft.trim());
    // 모바일에서 검색 후 키보드를 내린다
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setDraft('');
    onSearch('');
    inputRef.current?.focus();
  };

  const hasDraft = draft.length > 0;

  return (
    <form
      autoComplete="off"
      className="group relative desktop:mx-auto desktop:max-w-[720px]"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        전시·작품 검색
      </label>
      <input
        className={cn(
          'typography-body-xl-medium h-13.5 w-full appearance-none rounded-full bg-[#f4f4f5] pl-5 text-[#18181b] outline-none transition-colors duration-fast placeholder:font-normal placeholder:text-[#71717b] focus:bg-[#f0f0f3] [&::-webkit-search-cancel-button]:hidden',
          hasDraft ? 'pr-23' : 'pr-13',
        )}
        enterKeyHint="search"
        id={inputId}
        name="q"
        onChange={(event) => setDraft(event.target.value)}
        placeholder="전시·작품을 검색해보세요"
        ref={inputRef}
        spellCheck={false}
        type="search"
        value={draft}
      />
      {hasDraft ? (
        <button
          aria-label="검색어 지우기"
          className="absolute top-1.75 right-12 grid size-10 cursor-pointer place-items-center rounded-full text-[#71717b] transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] [@media(hover:hover)]:hover:text-[#18181b]"
          onClick={handleClear}
          type="button"
        >
          <ExploreCloseIcon className="size-5" />
        </button>
      ) : null}
      <button
        aria-label="검색"
        className="absolute top-1.75 right-2 grid size-10 cursor-pointer place-items-center rounded-full text-[#71717b] transition-colors duration-fast group-focus-within:text-[#18181b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
        type="submit"
      >
        <ExploreSearchIcon className="size-5" />
      </button>
    </form>
  );
}
