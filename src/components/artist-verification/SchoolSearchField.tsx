import { Search } from 'lucide-react';

import { ArtistVerificationField } from './ArtistVerificationField';
import { VerificationTextField } from './VerificationTextField';

const SCHOOL_SUGGESTIONS = [
  { id: 'school-chungang', name: '중앙대' },
  { id: 'school-hansung', name: '한성대' },
];

interface SchoolSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  showSuggestions: boolean;
  onFocus: () => void;
  onSelect: (value: string) => void;
}

export function SchoolSearchField({
  value,
  onChange,
  showSuggestions,
  onFocus,
  onSelect,
}: SchoolSearchFieldProps) {
  return (
    <ArtistVerificationField label="대학교" htmlFor="school">
      <div className="relative">
        <div onFocus={onFocus}>
          <VerificationTextField
            id="school"
            value={value}
            onChange={onChange}
            placeholder="학교명을 검색해주세요"
            right={<Search className="size-[15px] shrink-0 text-faint" strokeWidth={2} />}
          />
        </div>

        {showSuggestions ? (
          <div className="absolute left-0 right-0 top-10 z-20 rounded-[14px] border border-line-soft bg-card px-[14px] py-[11px] shadow-[0_2px_8px_rgba(17,17,17,0.03)]">
            <ul className="flex flex-col gap-3">
              {SCHOOL_SUGGESTIONS.map((school) => (
                <li key={school.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(school.name)}
                    className="w-full text-left typo-body-sm-regular text-main"
                  >
                    {school.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ArtistVerificationField>
  );
}
