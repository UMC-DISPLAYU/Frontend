/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ImageUploader } from '@/components/common';
import { AffiliationInput, ExhibitionHeader } from '@/components/exhibition-register';
import { ChipGroup, RequiredLabel } from '@/components/ui';
import {
  EXHIBITION_FIELD_LABELS,
  EXHIBITION_FIELDS,
  EXHIBITION_TYPE_LABELS,
  EXHIBITION_TYPES,
  type ExhibitionTypeGroup,
  MAX_POSTER_UPLOAD_IMAGES,
} from '@/constants/exhibition';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useImageUpload } from '@/hooks/useImageUpload';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function ExhibitionRegister() {
  const { data: artistProfile } = useMyArtistProfile();
  const imageUpload = useImageUpload({ domain: 'display' });
  const navigate = useNavigate();
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);

  /* 다음 단계에서 뒤로 왔을 때 앞서 입력한 값이 남아 있도록 state로 초기화합니다. */
  const { state } = useLocation();
  const { data: fetchedDetail } = useDisplayDetail(displayId);

  const restored = useMemo(() => {
    return displayId > 0 && !state?.displayDetail ? {} : (state ?? {});
  }, [displayId, state]);

  const displayDetail = (state?.displayDetail as DisplayDetailDto) || fetchedDetail || null;

  // 수정 모드 진입 시 최우선순위로 displayDetail 데이터를 기반으로 채웁니다.
  // 단, 다음 단계에서 뒤로가기(state 복원)한 경우를 위해 restored에 합칩니다.
  const initialTitle = (restored.title as string) ?? displayDetail?.title ?? '';
  const initialSubtitle = (restored.subtitle as string) ?? displayDetail?.subtitle ?? '';
  const initialIntro = (restored.intro as string) ?? displayDetail?.content ?? '';
  const initialType = (restored.type as string) ?? displayDetail?.displayType ?? null;
  const initialField = (restored.field as string[]) ?? displayDetail?.displayFields ?? [];
  const initialSchool =
    (restored.school as string) ?? displayDetail?.organization ?? artistProfile?.schoolName ?? '';
  const initialDepartment = (restored.department as string) ?? displayDetail?.department ?? '';
  const initialOrganizer = (restored.organizer as string) ?? displayDetail?.organization ?? '';

  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [intro, setIntro] = useState(initialIntro);
  const [type, setType] = useState<string | null>(initialType);
  const [field, setField] = useState<string[]>(initialField);

  const [school, setSchool] = useState(initialSchool);
  const [department, setDepartment] = useState(initialDepartment);
  const [organizer, setOrganizer] = useState(initialOrganizer);
  const schoolValue = school || artistProfile?.schoolName || '';
  const [initialImages, setInitialImages] = useState<string[]>(
    displayDetail?.images?.map((img) => img.imageUrl) || [],
  );

  useEffect(() => {
    if (displayId > 0 && !state?.displayDetail && fetchedDetail) {
      setTitle((prev) => (restored.title as string) ?? fetchedDetail.title ?? prev);
      setSubtitle((prev) => (restored.subtitle as string) ?? fetchedDetail.subtitle ?? prev);
      setIntro((prev) => (restored.intro as string) ?? fetchedDetail.content ?? prev);
      setType((prev) => (restored.type as string) ?? fetchedDetail.displayType ?? prev);
      setField((prev) => (restored.field as string[]) ?? fetchedDetail.displayFields ?? prev);
      setSchool((prev) => (restored.school as string) ?? fetchedDetail.organization ?? prev);
      setDepartment((prev) => (restored.department as string) ?? fetchedDetail.department ?? prev);
      setOrganizer((prev) => (restored.organizer as string) ?? fetchedDetail.organization ?? prev);
      setInitialImages((prev) =>
        restored.imageUrls
          ? (restored.imageUrls as string[])
          : fetchedDetail.images?.map((img) => img.imageUrl) || prev,
      );
    }
  }, [displayId, state, fetchedDetail, restored]);

  const selectedGroup = useMemo<ExhibitionTypeGroup | null>(() => {
    const found = EXHIBITION_TYPES.find((t) => t.label === type);
    return found?.group ?? null;
  }, [type]);

  const isAffiliationValid = () => {
    if (!type) return false;

    // 1. 졸업 전시(GRADUATION) & 과제 전시(TASK)
    if (type === '졸업 전시' || type === '과제 전시') {
      return schoolValue.trim() !== '' && department.trim() !== '';
    }

    // 2. 학과·학회 전시(CLUB - institution) & 연합 전시(JOINT)
    if (type === '학과·학회 전시' || type === '연합 전시') {
      return schoolValue.trim() !== '';
    }

    // 3. 소모임·동아리 전시(CLUB - organization) & 기타 단체 전시(ETC)
    if (type === '소모임·동아리 전시' || type === '기타 단체 전시') {
      return schoolValue.trim() !== '';
    }

    return true;
  };

  const handleRemoveInitialImage = (url: string) => {
    setInitialImages((prev) => prev.filter((img) => img !== url));
  };

  const isFormValid =
    (imageUpload.images.length > 0 || initialImages.length > 0) &&
    title.trim() !== '' &&
    type !== null &&
    field.length > 0 &&
    isAffiliationValid();

  const goNext = async () => {
    if (!isFormValid || imageUpload.isUploading) return;

    const newImageUrls = imageUpload.images.length > 0 ? await imageUpload.uploadImages() : [];
    const imageUrls = [...initialImages, ...newImageUrls];

    const nextPath =
      displayId > 0 ? `/exhibition/${displayId}/edit/basic` : '/exhibition/register/basic';

    navigate(nextPath, {
      state: {
        ...state,
        imageUrls,
        title,
        subtitle,
        intro,
        type,
        field,
        school: schoolValue,
        department,
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
              initialImages={initialImages}
              maxImages={MAX_POSTER_UPLOAD_IMAGES}
              onAddImages={imageUpload.addImages}
              onRemoveImage={imageUpload.removeImage}
              onRemoveInitialImage={handleRemoveInitialImage}
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
              labels={EXHIBITION_FIELD_LABELS}
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
