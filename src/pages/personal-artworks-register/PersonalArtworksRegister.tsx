import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BottomFixedBar, ImageUploader, LoadingView } from '@/components/common';
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
  const [searchParams] = useSearchParams();
  const personalArtworkId = Number(searchParams.get('id') ?? 0);
  return <PersonalArtworkForm key={personalArtworkId} personalArtworkId={personalArtworkId} />;
}

function PersonalArtworkForm({ personalArtworkId }: { personalArtworkId: number }) {
  const navigate = useNavigate();
  const isEditMode = Number.isFinite(personalArtworkId) && personalArtworkId > 0;
  const {
    data: personalArtwork,
    isFetching,
    isFetchedAfterMount,
  } = usePersonalArtwork(personalArtworkId);
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
  const { images, addImages, removeImage, setUploadedImages } = artworkUpload;
  const {
    images: processImages,
    addImages: addProcessImages,
    removeImage: removeProcessImage,
    setUploadedImages: setUploadedProcessImages,
  } = processUpload;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initializedArtworkId = useRef<number | null>(null);
  const submittingRef = useRef(false);
  const {
    control,
    formState: { errors, isValid, isSubmitting },
    register,
    reset,
    setValue,
    trigger,
    handleSubmit,
  } = useForm<PersonalArtworkRegisterFormValues>({
    resolver: zodResolver(personalArtworkRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      artworkImageCount: 0,
      title: '',
      intro: '',
      field: '회화',
      year: '',
      material: '',
      size: '',
      thoughts: '',
    },
  });
  const [intro = '', field = '회화', thoughts = ''] = useWatch({
    control,
    name: ['intro', 'field', 'thoughts'],
  });
  const yearInput = register('year', { onBlur: () => void trigger('year') });
  const createPersonalArtwork = useCreatePersonalArtwork();
  const updatePersonalArtwork = useUpdatePersonalArtwork();

  useEffect(() => {
    setValue('artworkImageCount', images.length, { shouldValidate: true });
  }, [images.length, setValue]);

  useEffect(() => {
    if (
      !isEditMode ||
      isFetching ||
      !personalArtwork ||
      personalArtwork.personalArtworkId !== personalArtworkId ||
      initializedArtworkId.current === personalArtworkId
    ) {
      return;
    }
    initializedArtworkId.current = personalArtworkId;

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

    // 같은 작품의 재조회가 작성 중인 입력과 이미지 선택을 덮어쓰지 않게 최초 한 번만 복원합니다.
    setUploadedImages(artworkImages);
    setUploadedProcessImages(processImages);
    reset({
      artworkImageCount: artworkImages.length,
      title: personalArtwork.artworkName ?? '',
      intro: personalArtwork.content ?? '',
      field: nextField,
      year: nextYear,
      material: personalArtwork.materialMedia ?? '',
      size: personalArtwork.size ?? '',
      thoughts: personalArtwork.point ?? '',
    });
  }, [
    isEditMode,
    isFetching,
    personalArtwork,
    personalArtworkId,
    reset,
    setUploadedImages,
    setUploadedProcessImages,
  ]);

  /* resolver가 검증한 입력값으로 이미지를 업로드한 뒤 작품을 등록합니다. */
  const submitPersonalArtwork = async () => {
    if (!canSubmitPersonalArtwork || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError(null);

    try {
      await handleSubmit(async (values) => {
        let artworkImageUrls: string[];
        let processImageUrls: string[];
        try {
          artworkImageUrls = await artworkUpload.uploadImages();
          processImageUrls = await processUpload.uploadImages();
        } catch {
          setSubmitError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
          return;
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

        const selectedFieldLabels = values.field
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
          artworkName: values.title,
          content: values.intro,
          type: artworkType,
          types: artworkTypes.length > 0 ? artworkTypes : [artworkType],
          productionYear: toPersonalArtworkProductionYear(values.year),
          materialMedia: values.material,
          size: values.size,
          point: values.thoughts,
          images: [
            ...artworkImageUrls.map((url, index) => toImage(url, index, 'ARTWORK')),
            ...processImageUrls.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
          ],
        };

        if (isEditMode) {
          await updatePersonalArtwork.mutateAsync({ personalArtworkId, body });
          navigate(`/personal-artworks/${personalArtworkId}`, { replace: true });
          return;
        }

        await createPersonalArtwork.mutateAsync(body);
        navigate('/personal-artworks/complete', { state: { type: 'personalArtwork' } });
      })();
    } catch {
      setSubmitError(
        `작품 ${isEditMode ? '수정' : '등록'}에 실패했어요. 잠시 후 다시 시도해주세요.`,
      );
    } finally {
      submittingRef.current = false;
    }
  };

  if (isEditMode && isFetching && !isFetchedAfterMount) {
    return <LoadingView message="작품 정보를 불러오는 중..." />;
  }

  return (
    <div className="mx-auto min-h-dvh w-96 bg-page">
      <ExhibitionHeader title={isEditMode ? '작품 수정' : '작품 등록'} />

      <main>
        <div className="flex flex-col gap-6 px-5 pb-bottom-bar-offset">
          <div className="self-stretch flex justify-center">
            <ImageUploader
              images={images}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              padded
              className="[justify-content:safe_center]"
              onAddImages={addImages}
              onRemoveImage={removeImage}
              emptyLabel="이미지 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-title">
              작품명
            </RequiredLabel>
            <input
              id="artwork-title"
              {...register('title', { onBlur: () => void trigger('title') })}
              placeholder="작품명을 입력해주세요"
              className={INPUT_CLASS}
            />
            {errors.title?.message && (
              <p className="typo-body-xxs-regular text-error px-2">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-intro">작품설명</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-intro"
                {...register('intro')}
                maxLength={1500}
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
                }}
                maxSelect={2}
                aria-label="작품분야"
                className="flex flex-wrap gap-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="flex min-w-0 flex-col gap-3">
              <RequiredLabel required htmlFor="artwork-year">
                제작연도
              </RequiredLabel>
              <input
                id="artwork-year"
                {...yearInput}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => {
                  event.target.value = sanitizePersonalArtworkYearInput(event.target.value);
                  void yearInput.onChange(event);
                }}
                placeholder="2026"
                className={INPUT_CLASS}
              />
              {errors.year?.message && (
                <p className="typo-body-xxs-regular text-error px-2">{errors.year.message}</p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <RequiredLabel required htmlFor="artwork-material">
                재료/매체
              </RequiredLabel>
              <input
                id="artwork-material"
                {...register('material', { onBlur: () => void trigger('material') })}
                placeholder="아크릴, 캔버스"
                className={INPUT_CLASS}
              />
              {errors.material?.message && (
                <p className="typo-body-xxs-regular text-error px-2">{errors.material.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-size">규격</RequiredLabel>
            <input
              id="artwork-size"
              {...register('size')}
              placeholder="90 × 120 cm"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>작품과정</RequiredLabel>
            <ImageUploader
              images={processImages}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              onAddImages={addProcessImages}
              onRemoveImage={removeProcessImage}
              emptyLabel="작업과정 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-thoughts">감상 포인트</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-thoughts"
                {...register('thoughts')}
                maxLength={1500}
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
          disabled={!canSubmitPersonalArtwork || !isValid || isSubmitting}
          onClick={submitPersonalArtwork}
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          {isSubmitting ? (isEditMode ? '수정 중' : '등록 중') : '완료'}
        </button>
      </BottomFixedBar>
    </div>
  );
}
