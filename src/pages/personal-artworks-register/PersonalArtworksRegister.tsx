import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BottomFixedBar, ImageUploader } from '@/components/common';
import { ChipGroup, ExhibitionHeader, RequiredLabel } from '@/components/ui';
import {
  ARTWORK_FIELD_MAP,
  ARTWORK_TYPE_LABEL_MAP,
  DEFAULT_ARTWORK_IMAGE_HEIGHT,
  DEFAULT_ARTWORK_IMAGE_WIDTH,
  MAX_PERSONAL_ARTWORK_IMAGES,
} from '@/constants';
import {
  useCreatePersonalArtwork,
  usePersonalArtwork,
  useUpdatePersonalArtwork,
} from '@/hooks/queries/usePersonalArtwork';
import { useImageUpload } from '@/hooks/useImageUpload';
import { usePersonalArtworkPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

import {
  type PersonalArtworkRegisterFormValues,
  personalArtworkRegisterSchema,
  sanitizePersonalArtworkYearInput,
  toPersonalArtworkProductionYear,
} from './personalArtworksRegister.schema';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function PersonalArtworksRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personalArtworkId = Number(searchParams.get('id') ?? 0);
  const isEditMode = Number.isFinite(personalArtworkId) && personalArtworkId > 0;
  const { data: personalArtwork } = usePersonalArtwork(personalArtworkId);
  const personalArtworkPolicy = usePersonalArtworkPolicy(personalArtwork);
  const canSubmitPersonalArtwork = isEditMode
    ? Boolean(personalArtwork) && hasPermission(personalArtworkPolicy, 'edit')
    : hasPermission(personalArtworkPolicy, 'create');

  const artworkUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_PERSONAL_ARTWORK_IMAGES,
  });
  const processUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_PERSONAL_ARTWORK_IMAGES,
  });
  const { images, addImages, removeImage } = artworkUpload;
  const {
    images: processImages,
    addImages: addProcessImages,
    removeImage: removeProcessImage,
  } = processUpload;
  const [title, setTitle] = useState('');
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const [intro, setIntro] = useState('');
  const [field, setField] = useState<string>('회화');
  const [year, setYear] = useState('');
  const [isYearTouched, setIsYearTouched] = useState(false);
  const [material, setMaterial] = useState('');
  const [isMaterialTouched, setIsMaterialTouched] = useState(false);
  const [size, setSize] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [initialArtworkImages, setInitialArtworkImages] = useState<string[]>([]);
  const [initialProcessImages, setInitialProcessImages] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors },
    register,
    setValue,
    trigger,
  } = useForm<PersonalArtworkRegisterFormValues>({
    resolver: zodResolver(personalArtworkRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      artworkImageCount: images.length,
      title,
      intro,
      field,
      year,
      material,
      size,
      thoughts,
    },
  });

  const createPersonalArtwork = useCreatePersonalArtwork();
  const updatePersonalArtwork = useUpdatePersonalArtwork();
  /* 이미지 업로드는 mutation 시작 전에 실행되므로 제출 전 구간까지 함께 잠급니다. */
  const [isUploading, setIsUploading] = useState(false);
  const isSubmitting =
    isUploading || createPersonalArtwork.isPending || updatePersonalArtwork.isPending;
  const artworkImageCount = initialArtworkImages.length + images.length;

  const formValue = {
    artworkImageCount,
    title,
    intro,
    field,
    year,
    material,
    size,
    thoughts,
  };
  const isFormValid =
    canSubmitPersonalArtwork && personalArtworkRegisterSchema.safeParse(formValue).success;
  const formError = personalArtworkRegisterSchema.safeParse(formValue).error;
  const getFormError = (fieldName: keyof PersonalArtworkRegisterFormValues) =>
    formError?.issues.find((issue) => issue.path[0] === fieldName)?.message;
  const titleError = isTitleTouched ? getFormError('title') : undefined;
  const yearError = isYearTouched ? getFormError('year') : undefined;
  const materialError = isMaterialTouched ? getFormError('material') : undefined;

  useEffect(() => {
    register('year');
  }, [register]);

  useEffect(() => {
    if (!isEditMode || !personalArtwork) return;

    const artworkImages = personalArtwork.images
      .filter((image) => image.imageType !== 'WORK_PROCESS')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.imageUrl);
    const processImages = personalArtwork.images
      .filter((image) => image.imageType === 'WORK_PROCESS')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.imageUrl);
    const artworkTypeValues =
      personalArtwork.types && personalArtwork.types.length > 0
        ? personalArtwork.types
        : personalArtwork.type.split(',');
    const fieldLabels = artworkTypeValues
      .map((type) => ARTWORK_TYPE_LABEL_MAP[type.trim()])
      .filter((label): label is string => Boolean(label));
    const nextField = fieldLabels.length > 0 ? fieldLabels.join(', ') : '기타';
    const nextYear = String(personalArtwork.productionYear || '');

    // 수정 모드에서는 서버 응답을 등록 폼 상태로 한 번 옮겨 담습니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialArtworkImages(artworkImages);
    setInitialProcessImages(processImages);
    setTitle(personalArtwork.artworkName ?? '');
    setIntro(personalArtwork.content ?? '');
    setField(nextField);
    setYear(nextYear);
    setMaterial(personalArtwork.materialMedia ?? '');
    setSize(personalArtwork.size ?? '');
    setThoughts(personalArtwork.point ?? '');

    setValue('artworkImageCount', artworkImages.length, { shouldValidate: true });
    setValue('title', personalArtwork.artworkName ?? '', { shouldValidate: true });
    setValue('intro', personalArtwork.content ?? '', { shouldValidate: true });
    setValue('field', nextField, { shouldValidate: true });
    setValue('year', nextYear, { shouldValidate: true });
    setValue('material', personalArtwork.materialMedia ?? '', { shouldValidate: true });
    setValue('size', personalArtwork.size ?? '', { shouldValidate: true });
    setValue('thoughts', personalArtwork.point ?? '', { shouldValidate: true });
  }, [isEditMode, personalArtwork, setValue]);

  /* 이미지를 업로드한 뒤 작품을 등록합니다. */
  const handleSubmit = async () => {
    const parsed = personalArtworkRegisterSchema.safeParse(formValue);
    if (!canSubmitPersonalArtwork || !parsed.success || isSubmitting) return;

    setSubmitError(null);

    let artworkImageUrls: string[] = [];
    let processImageUrls: string[] = [];
    setIsUploading(true);
    try {
      artworkImageUrls = await Promise.all(
        artworkUpload.files.map((file) => artworkUpload.uploadImage(file)),
      );
      processImageUrls = await Promise.all(
        processUpload.files.map((file) => processUpload.uploadImage(file)),
      );
    } catch {
      setSubmitError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    } finally {
      setIsUploading(false);
    }

    /*
     * 서버가 width/height를 @Positive 원시 int로 받아 0이나 누락은 거절됩니다.
     * 화면에서 실제 크기를 쓰지 않으므로 고정값을 보냅니다.
     */
    const toImage = (imageUrl: string, index: number, imageType: string) => ({
      imageUrl,
      isThumbnail: imageType === 'ARTWORK' && index === 0,
      imageType,
      width: DEFAULT_ARTWORK_IMAGE_WIDTH,
      height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
      sortOrder: index + 1,
    });

    const selectedFieldLabels = field
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const artworkTypes = Array.from(
      new Set(
        selectedFieldLabels
          .map((label) => ARTWORK_FIELD_MAP[label])
          .filter((val): val is string => Boolean(val)),
      ),
    ).slice(0, 2);
    const artworkType = artworkTypes[0] ?? ARTWORK_FIELD_MAP['기타'];

    const body = {
      artworkName: title.trim(),
      content: intro.trim(),
      type: artworkType,
      types: artworkTypes.length > 0 ? artworkTypes : [artworkType],
      productionYear: toPersonalArtworkProductionYear(year),
      materialMedia: material.trim(),
      size: size.trim(),
      point: thoughts.trim(),
      images: [
        ...initialArtworkImages.map((url, index) => toImage(url, index, 'ARTWORK')),
        ...artworkImageUrls.map((url, index) =>
          toImage(url, initialArtworkImages.length + index, 'ARTWORK'),
        ),
        ...initialProcessImages.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
        ...processImageUrls.map((url, index) =>
          toImage(url, initialProcessImages.length + index, 'WORK_PROCESS'),
        ),
      ],
    };

    if (isEditMode) {
      updatePersonalArtwork.mutate(
        { personalArtworkId, body },
        {
          onSuccess: () => navigate(`/personal-artworks/${personalArtworkId}`, { replace: true }),
          onError: () => setSubmitError('작품 수정에 실패했어요. 잠시 후 다시 시도해주세요.'),
        },
      );
      return;
    }

    createPersonalArtwork.mutate(body, {
      onSuccess: () =>
        navigate('/personal-artworks/complete', {
          state: { type: 'personalArtwork' },
        }),
      onError: () => setSubmitError('작품 등록에 실패했어요. 잠시 후 다시 시도해주세요.'),
    });
  };

  return (
    <div className="mx-auto min-h-dvh w-96 bg-page">
      <ExhibitionHeader title={isEditMode ? '작품 수정' : '작품 등록'} />

      <main>
        <div className="flex flex-col gap-6 px-5 pb-bottom-bar-offset">
          <div className="self-stretch flex justify-center">
            <ImageUploader
              images={images}
              initialImages={initialArtworkImages}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              padded
              className="[justify-content:safe_center]"
              onAddImages={addImages}
              onRemoveImage={removeImage}
              onRemoveInitialImage={(url) =>
                setInitialArtworkImages((prev) => prev.filter((imageUrl) => imageUrl !== url))
              }
              emptyLabel="이미지 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-title">
              작품명
            </RequiredLabel>
            <input
              id="artwork-title"
              value={title}
              onBlur={() => setIsTitleTouched(true)}
              onChange={(e) => {
                setIsTitleTouched(true);
                setValue('title', e.target.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
                setTitle(e.target.value);
              }}
              placeholder="작품명을 입력해주세요"
              className={INPUT_CLASS}
            />
            {(titleError ?? errors.title?.message) && (
              <p className="typo-body-xxs-regular text-error px-2">
                {titleError ?? errors.title?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-intro">작품설명</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-intro"
                value={intro}
                maxLength={1500}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="작품에 대해 소개해주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {intro.length}/1500
              </div>
            </div>
          </div>

          {!isEditMode && (
            <div className="flex flex-col gap-3">
              <RequiredLabel required>작품분야</RequiredLabel>
              <ChipGroup
                options={Object.keys(ARTWORK_FIELD_MAP)}
                selected={
                  field
                    ? field
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={(next) => {
                  const nextStr = next.join(', ');
                  setValue('field', nextStr, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  setField(nextStr);
                }}
                maxSelect={2}
                aria-label="작품분야"
                className="flex flex-wrap gap-2"
              />
            </div>
          )}

          <div className={isEditMode ? 'grid grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
            <div className="flex min-w-0 flex-col gap-3">
              <RequiredLabel required htmlFor="artwork-year">
                제작연도
              </RequiredLabel>
              <input
                id="artwork-year"
                value={year}
                inputMode="numeric"
                maxLength={4}
                onBlur={() => {
                  setIsYearTouched(true);
                  setValue('year', year, { shouldTouch: true, shouldValidate: true });
                  void trigger('year');
                }}
                onChange={(e) => {
                  const nextYear = sanitizePersonalArtworkYearInput(e.target.value);
                  setIsYearTouched(true);
                  setValue('year', nextYear, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  void trigger('year');
                  setYear(nextYear);
                }}
                placeholder="2026"
                className={INPUT_CLASS}
              />
              {(yearError ?? errors.year?.message) && (
                <p className="typo-body-xxs-regular text-error px-2">
                  {yearError ?? errors.year?.message}
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <RequiredLabel required htmlFor="artwork-material">
                재료/매체
              </RequiredLabel>
              <input
                id="artwork-material"
                value={material}
                onBlur={() => setIsMaterialTouched(true)}
                onChange={(e) => {
                  setIsMaterialTouched(true);
                  setValue('material', e.target.value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  setMaterial(e.target.value);
                }}
                placeholder="아크릴, 캔버스"
                className={INPUT_CLASS}
              />
              {(materialError ?? errors.material?.message) && (
                <p className="typo-body-xxs-regular text-error px-2">
                  {materialError ?? errors.material?.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-size">규격</RequiredLabel>
            <input
              id="artwork-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="90 × 120 cm"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>작품과정</RequiredLabel>
            <ImageUploader
              images={processImages}
              initialImages={initialProcessImages}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              onAddImages={addProcessImages}
              onRemoveImage={removeProcessImage}
              onRemoveInitialImage={(url) =>
                setInitialProcessImages((prev) => prev.filter((imageUrl) => imageUrl !== url))
              }
              emptyLabel="작업과정 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-thoughts">감상 포인트</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-thoughts"
                value={thoughts}
                maxLength={1500}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {thoughts.length}/1500
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomFixedBar>
        {submitError && (
          <p className="typo-body-xs-regular mb-2 text-center text-error">{submitError}</p>
        )}
        <button
          type="button"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          {isSubmitting ? (isEditMode ? '수정 중' : '등록 중') : '완료'}
        </button>
      </BottomFixedBar>
    </div>
  );
}
