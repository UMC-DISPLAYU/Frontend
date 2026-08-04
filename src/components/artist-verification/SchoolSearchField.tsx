import { Search } from 'lucide-react';

import { ArtistVerificationField } from './ArtistVerificationField';
import { VerificationTextField } from './VerificationTextField';

interface SchoolSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: { name: string }[];
  showSuggestions: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: (value: string) => void;
  isLoading?: boolean;
}

export function SchoolSearchField({
  value,
  onChange,
  suggestions,
  showSuggestions,
  onFocus,
  onBlur,
  onSelect,
  isLoading = false,
}: SchoolSearchFieldProps) {
  const shouldShowSuggestions = showSuggestions && value.trim().length > 0;

  return (
    <ArtistVerificationField label="대학교" htmlFor="school">
      <div className="relative" onBlur={onBlur} onFocus={onFocus}>
        <div>
          <VerificationTextField
            id="school"
            value={value}
            onChange={onChange}
            placeholder="학교명을 검색해주세요"
            right={<Search className="size-[15px] shrink-0 text-faint" strokeWidth={2} />}
          />
        </div>

        {shouldShowSuggestions ? (
          <div className="absolute left-0 right-0 top-10 z-20 rounded-[14px] border border-line-soft bg-card px-[14px] py-[11px] shadow-[0_2px_8px_rgba(17,17,17,0.03)]">
            <ul className="flex flex-col gap-3">
              {isLoading ? (
                <li className="typo-body-sm-regular text-faint">검색 중...</li>
              ) : suggestions.length > 0 ? (
                suggestions.map((school) => (
                  <li key={school.name}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelect(school.name)}
                      className="w-full text-left typo-body-sm-regular text-main"
                    >
                      {school.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="typo-body-sm-regular text-faint">검색 결과가 없어요</li>
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </ArtistVerificationField>
  );
}
