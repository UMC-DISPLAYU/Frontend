import React, { useState, useRef, useMemo, useCallback } from "react";

const EXHIBITION_TYPES = [
  { label: "졸업 전시", group: "institution" },
  { label: "과제 전시", group: "institution" },
  { label: "학과·학회 전시", group: "institution" },
  { label: "연합 전시", group: "institution" },
  { label: "소모임·동아리 전시", group: "organization" },
  { label: "기타 단체 전시", group: "organization" },
] as const;

const EXHIBITION_FIELDS = [
  "회화", "디자인", "사진", "건축", "영상", "조소", "패션",
  "일러스트", "공예", "기타",
] as const;

const SCHOOL_LIST = [
  "가천대학교", "건국대학교", "경희대학교", "고려대학교",
  "국민대학교", "단국대학교", "동국대학교", "명지대학교",
  "서강대학교", "서울대학교", "성균관대학교", "숙명여자대학교",
  "연세대학교", "중앙대학교", "한양대학교", "홍익대학교",
] as const;

const BASE_INPUT_CLASS = "px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 text-xs text-neutral-900 placeholder:text-neutral-400 leading-4";

const RequiredLabel = React.memo(({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div className="inline-flex items-center gap-1">
    <span className="text-neutral-900 text-sm font-bold leading-5">{children}</span>
    {required && <span className="text-red-400 text-xs leading-5">*</span>}
  </div>
));
RequiredLabel.displayName = "RequiredLabel";

const Chip = React.memo(({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1.5 rounded-sm shadow-[4px_4px_12px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] transition-colors text-xs leading-4 tracking-tight whitespace-nowrap ${
      selected
        ? "outline-neutral-900 text-neutral-900 font-bold"
        : "outline-stone-300 text-neutral-600 font-normal"
    }`}
  >
    {label}
  </button>
));
Chip.displayName = "Chip";

export default function ExhibitionRegister() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [intro, setIntro] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);

  const [schoolQuery, setSchoolQuery] = useState("");
  const [school, setSchool] = useState("");
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [organizer, setOrganizer] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedGroup = useMemo(() => {
    const found = EXHIBITION_TYPES.find((t) => t.label === type);
    return found?.group ?? null;
  }, [type]);

  const handleImageClick = useCallback(() => {
    if (imageUrls.length < 4) {
      fileInputRef.current?.click();
    }
  }, [imageUrls.length]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - imageUrls.length;
    const filesToAdd = Math.min(files.length, remainingSlots);
    const newUrls = Array.from({ length: filesToAdd }, (_, i) =>
      URL.createObjectURL(files[i])
    );

    setImageUrls(prev => [...prev, ...newUrls]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageUrls.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim();
    if (!q) return [...SCHOOL_LIST];
    return SCHOOL_LIST.filter((s) => s.includes(q));
  }, [schoolQuery]);

  const selectSchool = useCallback((name: string) => {
    setSchool(name);
    setSchoolQuery(name);
    setSchoolOpen(false);
  }, []);

  const handleSchoolFocus = useCallback(() => {
    setSchoolOpen(true);
  }, []);

  return (
      <div className="w-full bg-neutral-50 relative flex flex-col h-screen">

        {/* 헤더 */}
        <div className="relative flex items-center justify-center px-5 py-4 flex-shrink-0">
          <button type="button" className="absolute left-5" aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-neutral-900 text-xl font-bold">전시 기본 정보</h1>
        </div>

        {/* 본문 (스크롤) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-28">
          <div className="mt-2 flex gap-2 flex-wrap">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative size-24 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-300 overflow-hidden">
                <img src={url} alt={`업로드된 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label={`이미지 ${index + 1} 삭제`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            {imageUrls.length < 4 && (
              <button
                type="button"
                onClick={handleImageClick}
                className="size-24 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col items-center justify-center gap-3"
                aria-label="이미지 업로드"
              >
                <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" stroke="#d4d4d4" strokeWidth="1.5" />
                    <path d="M4.5 10.5l2.5-2.5 2 2 2.5-2.5 1.5 1.5" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="6" r="1" stroke="#d4d4d4" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-neutral-900 text-xs">{imageUrls.length}/4</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            aria-label="이미지 파일 선택"
          />

          <div className="mt-8 flex flex-col gap-3">
            <RequiredLabel required>전시명</RequiredLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="전시명을 입력해주세요"
              className={BASE_INPUT_CLASS}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <RequiredLabel>전시 부제목</RequiredLabel>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="전시 부제목을 입력해주세요"
              className={BASE_INPUT_CLASS}
            />
          </div>

          {/* 전시소개 */}
          <div className="mt-5 flex flex-col gap-3">
            <RequiredLabel>전시소개</RequiredLabel>
            <div className="px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col gap-2">
              <textarea
                value={intro}
                maxLength={500}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="전시에 대해 소개해주세요"
                className="h-24 resize-none bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 leading-4 outline-none"
              />
              <div className="text-right text-neutral-400 text-xs leading-4">{intro.length}/500</div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <RequiredLabel required>전시유형</RequiredLabel>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="전시유형 선택">
              {EXHIBITION_TYPES.map((t) => (
                <Chip
                  key={t.label}
                  label={t.label}
                  selected={type === t.label}
                  onClick={() => setType(t.label)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <RequiredLabel required>전시분야</RequiredLabel>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="전시분야 선택">
              {EXHIBITION_FIELDS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  selected={field === f}
                  onClick={() => setField(f)}
                />
              ))}
            </div>
          </div>

          {/* 소속 정보 — 전시유형 선택 시 노출 */}
          {selectedGroup && (
            <div className="mt-5 flex flex-col gap-3 mb-35">
              <RequiredLabel required>소속 정보</RequiredLabel>

              {selectedGroup === "institution" ? (
                // 학교/기관명 + 세부소속
                <div className="rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-300">
                  {/* 학교/기관명 (검색 드롭다운) */}
                  <div className="px-4 py-3.5 border-b border-zinc-300 flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-600 text-xs font-bold leading-4">학교 / 기관명</span>
                      <span className="text-red-400 text-xs leading-5">*</span>
                    </div>
                    <div className="relative">
                      <div className="h-10 px-3 bg-neutral-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-2">
                        <input
                          value={schoolQuery}
                          onChange={(e) => {
                            setSchoolQuery(e.target.value);
                            setSchoolOpen(true);
                            setSchool("");
                          }}
                          onFocus={handleSchoolFocus}
                          onBlur={() => setTimeout(() => setSchoolOpen(false), 200)}
                          placeholder="학교명을 검색해주세요"
                          className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-stone-300 outline-none"
                        />
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="6" cy="6" r="4.4" stroke="#9ca3af" strokeWidth="1.25" />
                          <path d="M9.5 9.5l3 3" stroke="#9ca3af" strokeWidth="1.25" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* 검색 결과 드롭다운 */}
                      {schoolOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-neutral-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-300 shadow-lg">
                          {filteredSchools.length > 0 ? (
                            filteredSchools.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectSchool(s);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                              >
                                {s}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-neutral-400">
                              검색 결과가 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 세부소속 */}
                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-600 text-xs font-bold leading-4">세부소속</span>
                      <span className="text-red-400 text-xs leading-5">*</span>
                    </div>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="학과, 학회, 동아리명을 입력해주세요"
                      className="h-10 px-3 bg-neutral-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm text-neutral-900 placeholder:text-stone-300 outline-none"
                    />
                  </div>
                </div>
              ) : (
                // 주최 / 소속명
                <div className="rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-300 overflow-hidden">
                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-600 text-xs font-bold leading-4">주최 / 소속명</span>
                      <span className="text-red-400 text-xs leading-5">*</span>
                    </div>
                    <input
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                      placeholder="주최 또는 소속명을 입력해주세요"
                      className="h-10 px-3 bg-neutral-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm text-neutral-900 placeholder:text-stone-300 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>


        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-50 border-t border-stone-300 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
          <div className="px-5 pt-4 pb-4">
            <button
              type="button"
              className="w-full py-3 bg-neutral-900 rounded-xl text-neutral-50 text-sm font-bold leading-5"
            >
              다음
            </button>
          </div>
        </footer>
      </div>
  );
}
