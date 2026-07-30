import { useCallback, useMemo, useState } from 'react';

const SCHOOL_LIST = [
  '가천대학교',
  '건국대학교',
  '경희대학교',
  '고려대학교',
  '국민대학교',
  '단국대학교',
  '동국대학교',
  '명지대학교',
  '서강대학교',
  '서울대학교',
  '성균관대학교',
  '숙명여자대학교',
  '연세대학교',
  '중앙대학교',
  '한양대학교',
  '홍익대학교',
] as const;

interface SchoolSearchInputProps {
  value: string;
  onChange: (school: string) => void;
}

export function SchoolSearchInput({ value, onChange }: SchoolSearchInputProps) {
  const [schoolQuery, setSchoolQuery] = useState(value);
  const [schoolOpen, setSchoolOpen] = useState(false);

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim();
    if (!q) return [...SCHOOL_LIST];
    return SCHOOL_LIST.filter((s) => s.includes(q));
  }, [schoolQuery]);

  const selectSchool = useCallback(
    (name: string) => {
      onChange(name);
      setSchoolQuery(name);
      setSchoolOpen(false);
    },
    [onChange],
  );

  const handleSchoolFocus = useCallback(() => {
    setSchoolOpen(true);
  }, []);

  return (
    <div className="bg-card px-4 py-3.5 border-b border-line flex flex-col gap-2">
      <label htmlFor="school-search" className="flex items-center gap-1">
        <span className="text-sub600 typo-body-xs-bold leading-4">학교 / 기관명</span>
        <span className="text-red-400 typo-body-xs-regular leading-5">*</span>
      </label>
      <div className="relative">
        <div className="h-10 px-3 bg-page rounded-2xl outline outline-1 outline-offset-[-1px] outline-line-soft flex items-center gap-2 overflow-hidden">
          <input
            id="school-search"
            value={schoolQuery}
            onChange={(e) => {
              setSchoolQuery(e.target.value);
              setSchoolOpen(true);
              onChange('');
            }}
            onFocus={handleSchoolFocus}
            onBlur={() => setTimeout(() => setSchoolOpen(false), 200)}
            placeholder="학교명을 검색해주세요"
            className="flex-1 bg-transparent typo-body-sm-regular text-main placeholder:text-hint outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded"
          />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.4" stroke="#9ca3af" strokeWidth="1.25" />
            <path d="M9.5 9.5l3 3" stroke="#9ca3af" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </div>

        {schoolOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-line shadow-lg overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {filteredSchools.length > 0 ? (
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
