import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ImageUploader } from '@/components/common';
import { AffiliationInput, ExhibitionHeader } from '@/components/exhibition-register';
import { ChipGroup, RequiredLabel } from '@/components/ui';
import {
  EXHIBITION_FIELDS,
  EXHIBITION_TYPE_LABELS,
  EXHIBITION_TYPES,
  type ExhibitionTypeGroup,
  MAX_POSTER_UPLOAD_IMAGES,
} from '@/constants/exhibition';
import { useMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuthStore } from '@/stores/authStore';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function ExhibitionRegister() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: artistProfile } = useMyArtistProfile({ enabled: !!accessToken });
  const imageUpload = useImageUpload({ domain: 'display' });

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [intro, setIntro] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [field, setField] = useState<string[]>([]);

  const [school, setSchool] = useState(artistProfile?.schoolName || '');
  const [department, setDepartment] = useState('');
  const [organizer, setOrganizer] = useState('');
  const schoolValue = school || artistProfile?.schoolName || '';

  const selectedGroup = useMemo<ExhibitionTypeGroup | null>(() => {
    const found = EXHIBITION_TYPES.find((t) => t.label === type);
    return found?.group ?? null;
  }, [type]);

  const navigate = useNavigate();

  const isAffiliationValid = () => {
    if (!selectedGroup) return true;
    if (selectedGroup === 'institution') {
      return department.trim() !== '';
    }
    return organizer.trim() !== '';
  };

  const isFormValid =
    imageUpload.images.length > 0 &&
    title.trim() !== '' &&
    type !== null &&
    field.length > 0 &&
    isAffiliationValid();

  const goNext = async () => {
    if (!isFormValid || imageUpload.isUploading) return;

    const imageUrls = await imageUpload.uploadImages();

    navigate('/exhibition/basic', {
      state: {
        imageUrls,
        title,
        subtitle,
        intro,
        type,
        field,
        school,
        department,
        organizer,
      },
    });
  };

  return (
    <div className="w-96 h-screen mx-auto flex flex-col bg-page overflow-hidden">
      <ExhibitionHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-5 pt-2 pb-8">
          <div className="flex justify-center">
            <ImageUploader
              images={imageUpload.images}
              maxImages={MAX_POSTER_UPLOAD_IMAGES}
              onAddImages={imageUpload.addImages}
              onRemoveImage={imageUpload.removeImage}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required>전시명</RequiredLabel>
            <input
              id="exhibition-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="전시명을 입력해주세요"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>전시 부제목</RequiredLabel>
            <input
              id="exhibition-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="전시 부제목을 입력해주세요"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>전시소개</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="exhibition-intro"
                value={intro}
                maxLength={1500}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="전시에 대해 소개해주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {intro.length}/1500
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required>전시유형</RequiredLabel>
            <ChipGroup
              options={EXHIBITION_TYPE_LABELS}
              selected={type ? [type] : []}
              onChange={(next) => setType(next[0] ?? null)}
              maxSelect={1}
              aria-label="전시유형"
              className="flex flex-wrap items-center gap-1.5"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required>전시분야</RequiredLabel>
            <ChipGroup
              options={EXHIBITION_FIELDS}
              selected={field}
              onChange={setField}
              aria-label="전시분야"
            />
          </div>

          {selectedGroup && (
            <div className="flex flex-col gap-3">
              <RequiredLabel required>소속 정보</RequiredLabel>
              <AffiliationInput
                group={selectedGroup}
                school={schoolValue}
                onSchoolChange={setSchool}
                department={department}
                onDepartmentChange={setDepartment}
                organizer={organizer}
                onOrganizerChange={setOrganizer}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 px-5 py-4 bg-card border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        <button
          type="button"
          disabled={!isFormValid || imageUpload.isUploading}
          onClick={goNext}
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          {imageUpload.isUploading ? '이미지 업로드 중' : '다음'}
        </button>
      </footer>
    </div>
  );
}
