import { useCallback, useMemo, useState } from 'react';

import { useSearchSchools } from '@/hooks/queries/useSchoolEmailVerification';

interface SchoolSearchInputProps {
  value: string;
  onChange: (school: string) => void;
  readonly?: boolean;
}

export function SchoolSearchInput({ value, onChange, readonly = false }: SchoolSearchInputProps) {
  const [schoolQuery, setSchoolQuery] = useState(value);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const { data: schools = [], isLoading } = useSearchSchools(schoolQuery);
  const inputValue = readonly || value ? value : schoolQuery;

  const filteredSchools = useMemo(() => {
    if (readonly) return [];

    return schools.map((school) => school.name);
  }, [readonly, schools]);

  const selectSchool = useCallback(
    (name: string) => {
      onChange(name);
      setSchoolQuery(name);
      setSchoolOpen(false);
    },
    [onChange],
  );

  const handleSchoolFocus = useCallback(() => {
    if (!readonly) {
      setSchoolOpen(true);
    }
  }, [readonly]);

  return (
    <div className="bg-card px-4 py-3.5 border-b border-line flex flex-col gap-2">
      <label htmlFor="school-search" className="flex items-center gap-1">
        <span className="text-sub600 typo-body-xs-bold leading-4">학교 / 기관명</span>
        <span className="text-red-400 typo-body-xs-regular leading-5">*</span>
      </label>
      <div className="relative">
        <div className="h-10 px-3 bg-input-soft-bg rounded-2xl outline outline-1 outline-offset-[-1px] outline-line-soft flex items-center gap-2 overflow-hidden">
          <input
            id="school-search"
            value={inputValue}
            onChange={(e) => {
              if (!readonly) {
                setSchoolQuery(e.target.value);
                setSchoolOpen(true);
                onChange('');
              }
            }}
            onFocus={handleSchoolFocus}
            onBlur={() => setTimeout(() => setSchoolOpen(false), 200)}
            placeholder="학교명을 검색해주세요"
            readOnly={readonly}
            className={`flex-1 bg-transparent typo-body-sm-regular text-main placeholder:text-hint outline-none rounded ${
              readonly
                ? 'cursor-not-allowed'
                : 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
            }`}
          />
          {!readonly && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.4" stroke="#9ca3af" strokeWidth="1.25" />
              <path d="M9.5 9.5l3 3" stroke="#9ca3af" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {!readonly && schoolOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-line shadow-lg overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-neutral-400">검색 중입니다</div>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSchool(s);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sub700 typo-body-sm-regular hover:bg-box"
                  >
                    {s}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-neutral-400">검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
