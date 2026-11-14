import { type FocusEvent, type KeyboardEvent, useId, useState } from 'react';

import { SearchIcon } from './ArtistVerifyIcons';
import { TAP_BASE } from './artistVerifyStyles';
import { VerifyField } from './VerifyField';
import { VerifyInput } from './VerifyInput';

type SchoolSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  suggestions: { name: string }[];
  isLoading?: boolean;
  /** 목록에서 학교를 고른 상태. 고른 뒤에는 포커스해도 목록을 다시 열지 않는다 */
  selected?: boolean;
};

const messageClass = 'px-3 py-3.5 text-[14px] text-[#71717b]';

/* 검색어와 겹치는 부분을 굵게(프로토타입 mark) */
function HighlightedName({ name, keyword }: { name: string; keyword: string }) {
  const index = keyword ? name.indexOf(keyword) : -1;
  if (index < 0) return name;
  return (
    <>
      {name.slice(0, index)}
      <mark className="bg-transparent font-semibold text-inherit">
        {name.slice(index, index + keyword.length)}
      </mark>
      {name.slice(index + keyword.length)}
    </>
  );
}

export function SchoolSearchField({
  value,
  onChange,
  onSelect,
  suggestions,
  isLoading = false,
  selected = false,
}: SchoolSearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const keyword = value.trim();
  const showList = isOpen && keyword.length > 0;
  const options = isLoading ? [] : suggestions;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const pick = (name: string) => {
    close();
    onSelect(name);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showList || event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!options.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (activeIndex + step + options.length) % options.length;
      setActiveIndex(next);
      document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = options[activeIndex >= 0 ? activeIndex : options.length === 1 ? 0 : -1];
      if (target) pick(target.name);
    } else if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <VerifyField className="mt-5" htmlFor="school" label="대학교">
      <div className="relative" onBlur={handleBlur}>
        <VerifyInput
          aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showList}
          autoComplete="off"
          enterKeyHint="search"
          id="school"
          onChange={(event) => {
            setIsOpen(true);
            setActiveIndex(-1);
            onChange(event.target.value);
          }}
          onFocus={() => {
            if (!selected) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="학교명을 검색해주세요"
          right={<SearchIcon className="size-[22px] shrink-0" />}
          role="combobox"
          spellCheck={false}
          value={value}
        />

        {showList ? (
          <div
            aria-label="대학교 검색 결과"
            className="absolute inset-x-0 top-[calc(100%+8px)] z-20 max-h-[288px] animate-[artist-verify-pop_.2s_cubic-bezier(.16,1,.3,1)] overflow-y-auto overscroll-contain rounded-[12px] border border-[#d4d4d8] bg-[#fff] py-1.5 shadow-[0_12px_32px_rgba(0,0,0,.08)]"
            id={listId}
            // 목록을 누를 때 입력칸 포커스가 빠져 목록이 먼저 닫히지 않게 한다
            onMouseDown={(event) => event.preventDefault()}
            role="listbox"
          >
            {isLoading ? (
              <p className={messageClass}>검색 중...</p>
            ) : options.length > 0 ? (
              options.map((school, index) => (
                <button
                  aria-selected={index === activeIndex}
                  className={`${TAP_BASE} block h-11 w-full px-3 text-left text-[14px] font-medium transition-[background-color] duration-150 hover:bg-[#f4f4f5] [@media(hover:hover)]:aria-selected:bg-[#f4f4f5]`}
                  id={optionId(index)}
                  key={school.name}
                  onClick={() => pick(school.name)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  <HighlightedName keyword={keyword} name={school.name} />
                </button>
              ))
            ) : (
              <p className={messageClass}>검색 결과가 없어요</p>
            )}
          </div>
        ) : null}
      </div>
    </VerifyField>
  );
}
