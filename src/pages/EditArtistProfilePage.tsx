import { useEffect, useRef, useState } from 'react';

import { ChevronLeft, ImagePlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useHeaderContext } from '@/components/layout/headerContext';

const EXHIBITION_FIELDS = [
  '회화',
  '디자인',
  '사진',
  '건축',
  '영상',
  '조소',
  '패션',
  '일러스트',
  '공예',
  '기타',
] as const;

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

const INTRO_MAX = 100;

function ProfilePhotoField({
  image,
  onChange,
}: {
  image: string | null;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        className="flex size-24 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-card"
      >
        {image ? (
          <img src={image} alt="프로필 미리보기" className="size-full object-cover" />
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-page text-faint">
              <ImagePlus className="size-[18px]" strokeWidth={1.5} />
            </span>
            <span className="typo-body-xs-regular text-main">프로필 사진</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}

export function EditArtistProfilePage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useHeaderContext();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activityName, setActivityName] = useState('');
  const [intro, setIntro] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [school, setSchool] = useState('');
  const [schoolFocused, setSchoolFocused] = useState(false);

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const showSchoolDropdown = schoolFocused && school.trim().length > 0;

  const handleSubmit = () => {
    navigate(-1);
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">작가 프로필 설정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pb-32">
        <div className="mt-10 flex justify-center">
          <ProfilePhotoField image={profileImage} onChange={setProfileImage} />
        </div>

        <div className="mt-12 flex flex-col gap-5">
          {/* 활동명 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="activityName" className="typo-body-sm-bold text-main">
              활동명
            </label>
            <input
              id="activityName"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              maxLength={30}
              placeholder="활동명 입력(최대 30자)"
              className="h-9 rounded-lg border border-line bg-card px-3 typo-body-xs-regular text-main outline-none placeholder:text-faint focus:border-line-active"
            />
          </div>

          {/* 전시소개 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="intro" className="typo-body-sm-bold text-main">
              전시소개
            </label>
            <div className="rounded-lg border border-line bg-card px-3 py-2.5">
              <textarea
                id="intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value.slice(0, INTRO_MAX))}
                maxLength={INTRO_MAX}
                placeholder="전시에 대해 소개해주세요"
                rows={4}
                className="w-full resize-none bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-faint"
              />
              <div className="text-right typo-body-xs-regular text-faint">
                {intro.length}/{INTRO_MAX}
              </div>
            </div>
          </div>

          {/* 전시분야 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">전시분야</span>
            <div className="flex flex-wrap gap-2">
              {EXHIBITION_FIELDS.map((field) => {
                const active = selectedFields.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleField(field)}
                    className={`rounded-sm border px-2.5 py-1.5 transition-colors ${
                      active ? 'border-dark text-dark typo-body-xs-bold' : 'border-line text-sub600  typo-body-xs-regular'
                    }`}
                  >
                    {field}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 외부 링크 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="externalLink" className="typo-body-sm-bold text-main">
              외부 링크
            </label>
            <input
              id="externalLink"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="포트폴리오, 인스타그램, 개인 웹사이트 링크"
              className="h-11 rounded-2xl bg-card px-3.5 typo-body-sm-regular text-tag-blue outline-none placeholder:text-faint"
            />
          </div>

          {/* 소속 정보 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">소속 정보</span>
            <div className="rounded-2xl bg-card px-4 py-3.5">
              <label
                htmlFor="school"
                className="mb-2 block typo-body-xs-bold text-sub600"
              >
                학교 / 기관명
              </label>

              <div className="relative">
                <div className="flex h-10 items-center gap-2 rounded-2xl bg-page border border-line px-3">
                  <input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    onFocus={() => setSchoolFocused(true)}
                    onBlur={() => setTimeout(() => setSchoolFocused(false), 120)}
                    placeholder="학교명을 검색해주세요"
                    className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-line"
                  />
                  <Search className="size-4 shrink-0 text-faint" strokeWidth={1.5} />
                </div>

                {showSchoolDropdown && (
                  <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[208px] overflow-y-auto overscroll-contain rounded-2xl bg-card py-2 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]">
                    {SCHOOL_LIST.map((name, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => {
                            setSchool(name);
                            setSchoolFocused(false);
                          }}
                          className="w-full px-4 py-2.5 text-left typo-body-sm-regular text-main hover:bg-page"
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-b from-transparent via-page/80 to-page px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className="h-11 w-full rounded-xl bg-bt-black typo-body-sm-bold text-white"
        >
          완료
        </button>
      </footer>
    </div>
  );
}
