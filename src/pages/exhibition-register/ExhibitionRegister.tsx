/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomFixedBar, ImageUploader } from '@/components/common';
import { AffiliationInput } from '@/components/exhibition-register';
import { ChipGroup, ExhibitionHeader, RequiredLabel } from '@/components/ui';
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
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useImageUpload } from '@/hooks/useImageUpload';

import {
  type ExhibitionRegisterFormValues,
  exhibitionRegisterSchema,
} from './exhibitionRegister.schema';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function ExhibitionRegister() {
  const { data: artistProfile } = useMyArtistProfile();
  const { draft, hasDraft, updateDraft } = useExhibitionRegisterDraft();
  const imageUpload = useImageUpload({ domain: 'display' });
  const navigate = useNavigate();
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const shouldUseDraft = displayId === 0 && hasDraft;

  const { state } = useLocation();
  const { data: fetchedDetail } = useDisplayDetail(displayId);

  const restored = useMemo(() => {
    return displayId > 0 && !state?.displayDetail ? {} : (state ?? {});
  }, [displayId, state]);

  const displayDetail = (state?.displayDetail as DisplayDetailDto) || fetchedDetail || null;

  const [initialImages, setInitialImages] = useState<string[]>(
    shouldUseDraft ? draft.imageUrls : displayDetail?.images?.map((img) => img.imageUrl) || [],
  );

  const initialTitle = shouldUseDraft
    ? draft.title
    : ((restored.title as string) ?? displayDetail?.title ?? '');
  const initialSubtitle = shouldUseDraft
    ? draft.subtitle
    : ((restored.subtitle as string) ?? displayDetail?.subtitle ?? '');
  const initialIntro = shouldUseDraft
    ? draft.intro
    : ((restored.intro as string) ?? displayDetail?.content ?? '');
  const initialType = shouldUseDraft
    ? draft.type
    : ((restored.type as string) ?? displayDetail?.displayType ?? '');
  const initialField = shouldUseDraft
    ? (draft.field as ExhibitionRegisterFormValues['field'])
    : ((restored.field as ExhibitionRegisterFormValues['field']) ??
      (displayDetail?.displayFields as ExhibitionRegisterFormValues['field']) ??
      []);
  const initialSchool = shouldUseDraft
    ? draft.school
    : ((restored.school as string) ??
      displayDetail?.organization ??
      artistProfile?.schoolName ??
      '');
  const initialDepartment = shouldUseDraft
    ? draft.department
    : ((restored.department as string) ?? displayDetail?.department ?? '');
  const initialOrganizer = shouldUseDraft
    ? draft.organizer
    : ((restored.organizer as string) ?? displayDetail?.organization ?? '');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitted },
  } = useForm<ExhibitionRegisterFormValues>({
    resolver: zodResolver(exhibitionRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      imageUrls: [...initialImages],
      title: initialTitle,
      subtitle: initialSubtitle,
      intro: initialIntro,
      type: initialType as ExhibitionRegisterFormValues['type'],
      field: initialField,
      school: initialSchool,
      department: initialDepartment,
      organizer: initialOrganizer,
    },
  });

  const type = useWatch({ control, name: 'type' });
  const intro = useWatch({ control, name: 'intro' }) ?? '';
  const [
    watchedTitle,
    watchedSubtitle,
    watchedIntro,
    watchedType,
    watchedField,
    watchedSchool,
    watchedDepartment,
    watchedOrganizer,
  ] = useWatch({
    control,
    name: ['title', 'subtitle', 'intro', 'type', 'field', 'school', 'department', 'organizer'],
  });

  useEffect(() => {
    if (shouldUseDraft) {
      return;
    }

    if (displayId > 0 && !state?.displayDetail && fetchedDetail) {
      const restoredTitle = (restored.title as string) ?? fetchedDetail.title ?? '';
      const restoredSubtitle = (restored.subtitle as string) ?? fetchedDetail.subtitle ?? '';
      const restoredIntro = (restored.intro as string) ?? fetchedDetail.content ?? '';
      const restoredType = (restored.type as string) ?? fetchedDetail.displayType ?? '';
      const restoredField =
        (restored.field as ExhibitionRegisterFormValues['field']) ??
        (fetchedDetail.displayFields as ExhibitionRegisterFormValues['field']) ??
        [];
      const restoredSchool =
        (restored.school as string) ??
        fetchedDetail.organization ??
        artistProfile?.schoolName ??
        '';
      const restoredDepartment = (restored.department as string) ?? fetchedDetail.department ?? '';
      const restoredOrganizer = (restored.organizer as string) ?? fetchedDetail.organization ?? '';
      const restoredImages = restored.imageUrls
        ? (restored.imageUrls as string[])
        : fetchedDetail.images?.map((img) => img.imageUrl) || [];

      setInitialImages(restoredImages);

      reset({
        imageUrls: restoredImages,
        title: restoredTitle,
        subtitle: restoredSubtitle,
        intro: restoredIntro,
        type: restoredType as ExhibitionRegisterFormValues['type'],
        field: restoredField,
        school: restoredSchool,
        department: restoredDepartment,
        organizer: restoredOrganizer,
      });
    }
  }, [displayId, state, fetchedDetail, restored, artistProfile, reset, shouldUseDraft]);

  useEffect(() => {
    if (displayId > 0) {
      return;
    }

    updateDraft({
      title: watchedTitle ?? '',
      subtitle: watchedSubtitle ?? '',
      intro: watchedIntro ?? '',
      type: watchedType ?? '',
      field: watchedField ?? [],
      school: watchedSchool ?? '',
      department: watchedDepartment ?? '',
      organizer: watchedOrganizer ?? '',
    });
  }, [
    watchedTitle,
    watchedSubtitle,
    watchedIntro,
    watchedType,
    watchedField,
    watchedSchool,
    watchedDepartment,
    watchedOrganizer,
    updateDraft,
    displayId,
  ]);

  const selectedGroup = useMemo<ExhibitionTypeGroup | null>(() => {
    const found = EXHIBITION_TYPES.find((t) => t.label === type);
    return found?.group ?? null;
  }, [type]);

  const handleRemoveInitialImage = (url: string) => {
    const nextImages = initialImages.filter((img) => img !== url);
    setInitialImages(nextImages);
    updateDraft({ imageUrls: nextImages });
    setValue('imageUrls', [...nextImages, ...imageUpload.images.map((img) => img.previewUrl)], {
      shouldValidate: true,
    });
  };

  useEffect(() => {
    const currentPreviews = imageUpload.images.map((img) => img.previewUrl);
    setValue('imageUrls', [...initialImages, ...currentPreviews], { shouldValidate: true });
  }, [imageUpload.images, initialImages, setValue]);

  const onFormSubmit = async (data: ExhibitionRegisterFormValues) => {
    if (imageUpload.isUploading) return;

    const newImageUrls = imageUpload.images.length > 0 ? await imageUpload.uploadImages() : [];
    const finalImageUrls = [...initialImages, ...newImageUrls];
    updateDraft({
      imageUrls: finalImageUrls,
      title: data.title,
      subtitle: data.subtitle,
      intro: data.intro,
      type: data.type,
      field: data.field,
      school: data.school || artistProfile?.schoolName || '',
      department: data.department,
      organizer: data.organizer,
    });

    const nextPath =
      displayId > 0 ? `/exhibition/${displayId}/edit/basic` : '/exhibition/register/basic';

    navigate(nextPath, {
      state: {
        ...state,
        imageUrls: finalImageUrls,
        title: data.title,
        subtitle: data.subtitle,
        intro: data.intro,
        type: data.type,
        field: data.field,
        school: data.school || artistProfile?.schoolName || '',
        department: data.department,
        organizer: data.organizer,
      },
    });
  };

  return (
    <div className="mx-auto min-h-dvh w-96 bg-page">
      <ExhibitionHeader title="전시 등록" />

      <main>
        <form
          id="exhibition-register-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-6 px-5 pb-bottom-bar-offset"
        >
          <div className="flex flex-col items-center gap-1">
            <ImageUploader
              images={imageUpload.images}
              initialImages={initialImages}
              maxImages={MAX_POSTER_UPLOAD_IMAGES}
              padded
              className="[justify-content:safe_center]"
              onAddImages={imageUpload.addImages}
              onRemoveImage={imageUpload.removeImage}
              onRemoveInitialImage={handleRemoveInitialImage}
            />
            {errors.imageUrls &&
              (errors.imageUrls.type === 'too_big' ||
                errors.imageUrls.type === 'max' ||
                isSubmitted) && (
                <span className="typo-body-xxs-regular text-error text-center px-2">
                  {errors.imageUrls.message}
                </span>
              )}
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel required>전시명</RequiredLabel>
            <input
              id="exhibition-title"
              placeholder="전시명을 입력해주세요"
              className={INPUT_CLASS}
              {...register('title')}
            />
            {errors.title && (
              <span className="typo-body-xxs-regular text-error px-2">{errors.title.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel>전시 부제목</RequiredLabel>
            <input
              id="exhibition-subtitle"
              placeholder="전시 부제목을 입력해주세요"
              className={INPUT_CLASS}
              {...register('subtitle')}
            />
            {errors.subtitle && (
              <span className="typo-body-xxs-regular text-error px-2">
                {errors.subtitle.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel>전시소개</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="exhibition-intro"
                maxLength={1500}
                placeholder="전시에 대해 소개해주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
                {...register('intro')}
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {intro.length}/1500
              </div>
            </div>
            {errors.intro && (
              <span className="typo-body-xxs-regular text-error px-2">{errors.intro.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel required>전시유형</RequiredLabel>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <ChipGroup
                  options={EXHIBITION_TYPE_LABELS}
                  selected={value ? [value] : []}
                  onChange={(next) => onChange(next[0] ?? '')}
                  maxSelect={1}
                  aria-label="전시유형"
                  className="flex flex-wrap items-center gap-1.5"
                />
              )}
            />
            {errors.type && (
              <span className="typo-body-xxs-regular text-error px-2">{errors.type.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <RequiredLabel required>전시분야</RequiredLabel>
            <Controller
              control={control}
              name="field"
              render={({ field: { value, onChange } }) => (
                <ChipGroup
                  options={EXHIBITION_FIELDS}
                  labels={EXHIBITION_FIELD_LABELS}
                  selected={value}
                  onChange={onChange}
                  aria-label="전시분야"
                />
              )}
            />
            {errors.field && (
              <span className="typo-body-xxs-regular text-error px-2">{errors.field.message}</span>
            )}
          </div>

          {selectedGroup && (
            <div className="flex flex-col gap-3">
              <RequiredLabel required>소속 정보</RequiredLabel>
              <Controller
                control={control}
                name="school"
                render={({ field: { value: schoolVal, onChange: onSchoolChange } }) => (
                  <Controller
                    control={control}
                    name="department"
                    render={({ field: { value: deptVal, onChange: onDeptChange } }) => (
                      <Controller
                        control={control}
                        name="organizer"
                        render={({ field: { value: orgVal, onChange: onOrgChange } }) => (
                          <AffiliationInput
                            group={selectedGroup}
                            school={
                              selectedGroup === 'organization'
                                ? orgVal || ''
                                : schoolVal || artistProfile?.schoolName || ''
                            }
                            onSchoolChange={
                              selectedGroup === 'organization' ? onOrgChange : onSchoolChange
                            }
                            department={deptVal || ''}
                            onDepartmentChange={onDeptChange}
                            readonly={selectedGroup === 'institution'}
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
              {errors.department && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.department.message}
                </span>
              )}
              {errors.organizer && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.organizer.message}
                </span>
              )}
            </div>
          )}
        </form>
      </main>

      <BottomFixedBar>
        <button
          form="exhibition-register-form"
          type="submit"
          disabled={!isValid || imageUpload.isUploading}
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          {imageUpload.isUploading ? '이미지 업로드 중' : '다음'}
        </button>
      </BottomFixedBar>
    </div>
  );
}
