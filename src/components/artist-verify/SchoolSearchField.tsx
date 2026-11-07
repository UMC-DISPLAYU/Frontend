import { type FocusEvent, useId, useState } from 'react';

import searchIcon from '@/assets/icons/SearchBoldIcon.svg';

import { ArtistVerifyField } from './ArtistVerifyField';
import { ArtistVerifyInput } from './ArtistVerifyInput';

type SchoolSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  suggestions: { name: string }[];
  isLoading?: boolean;
  /** 이메일 인증이 끝나면 학교를 바꿀 수 없다. */
  locked?: boolean;
};

const listItemClass = 'typography-body-xl-regular flex h-11 w-full items-center px-3 text-left';

export function SchoolSearchField({
  value,
  onChange,
  onSelect,
  suggestions,
  isLoading = false,
  locked = false,
}: SchoolSearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const showList = !locked && isOpen && value.trim().length > 0;

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <ArtistVerifyField htmlFor="school" label="대학교">
      <div className="relative" onBlur={handleBlur}>
        <ArtistVerifyInput
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showList}
          autoComplete="off"
          id="school"
          onChange={(event) => {
            setIsOpen(true);
            onChange(event.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="학교명"
          readOnly={locked}
          right={locked ? null : <img alt="" className="size-6 shrink-0" src={searchIcon} />}
          role="combobox"
          value={value}
        />

        {showList ? (
          <ul
            className="absolute inset-x-0 top-full z-20 mt-1 flex max-h-70.5 flex-col overflow-y-auto rounded-12 border border-primary bg-primary-white py-2 shadow-card"
            id={listId}
            role="listbox"
          >
            {isLoading ? (
              <li className={`${listItemClass} text-tertiary`}>검색 중...</li>
            ) : suggestions.length > 0 ? (
              suggestions.map((school) => (
                <li aria-selected={school.name === value} key={school.name} role="option">
                  <button
                    className={`${listItemClass} cursor-pointer text-primary`}
                    onClick={() => {
                      setIsOpen(false);
                      onSelect(school.name);
                    }}
                    // 버튼이 포커스를 가져가면 input blur로 목록이 먼저 닫혀 클릭이 무시된다
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    {school.name}
                  </button>
                </li>
              ))
            ) : (
              <li className={`${listItemClass} text-tertiary`}>검색 결과가 없어요</li>
            )}
          </ul>
        ) : null}
      </div>
    </ArtistVerifyField>
  );
}
