import { useMemo, useState } from 'react';

import {
  AffiliationInput,
  ExhibitionHeader,
  ImageUploader,
} from '@/components/exhibition-register';
import { Chip, RequiredLabel } from '@/components/ui';
import {
  EXHIBITION_FIELDS,
  EXHIBITION_TYPES,
  type ExhibitionTypeGroup,
} from '@/constants/exhibition';

const BASE_INPUT_CLASS =
  'px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 text-xs text-neutral-900 placeholder:text-neutral-400 leading-4';

export function ExhibitionRegister() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [intro, setIntro] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);

  const [school, setSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [organizer, setOrganizer] = useState('');

  const selectedGroup = useMemo<ExhibitionTypeGroup | null>(() => {
    const found = EXHIBITION_TYPES.find((t) => t.label === type);
    return found?.group ?? null;
  }, [type]);

  return (
    <div className="w-full bg-neutral-50 relative flex flex-col h-screen">
      <ExhibitionHeader />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-28">
        <ImageUploader maxImages={4} />

        <div className="mt-8 flex flex-col gap-3">
          <RequiredLabel required htmlFor="exhibition-title">
            전시명
          </RequiredLabel>
          <input
            id="exhibition-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="전시명을 입력해주세요"
            className={BASE_INPUT_CLASS}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <RequiredLabel htmlFor="exhibition-subtitle">
            전시 부제목
          </RequiredLabel>
          <input
            id="exhibition-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="전시 부제목을 입력해주세요"
            className={BASE_INPUT_CLASS}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <RequiredLabel htmlFor="exhibition-intro">전시소개</RequiredLabel>
          <div className="px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col gap-2">
            <textarea
              id="exhibition-intro"
              value={intro}
              maxLength={500}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="전시에 대해 소개해주세요"
              className="h-24 resize-none bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 leading-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded"
            />
            <div className="text-right text-neutral-400 text-xs leading-4">
              {intro.length}/500
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <span id="exhibition-type-label">
            <RequiredLabel required>전시유형</RequiredLabel>
          </span>
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="radiogroup"
            aria-labelledby="exhibition-type-label"
          >
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
          <span id="exhibition-field-label">
            <RequiredLabel required>전시분야</RequiredLabel>
          </span>
          <div
            className="flex flex-wrap items-center gap-2"
            role="radiogroup"
            aria-labelledby="exhibition-field-label"
          >
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

        {selectedGroup && (
          <div className="mt-5 flex flex-col gap-3 mb-35">
            <span id="affiliation-label">
              <RequiredLabel required>소속 정보</RequiredLabel>
            </span>

            <AffiliationInput
              group={selectedGroup}
              school={school}
              onSchoolChange={setSchool}
              department={department}
              onDepartmentChange={setDepartment}
              organizer={organizer}
              onOrganizerChange={setOrganizer}
            />
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
