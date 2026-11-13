import { type ChangeEvent, type ReactNode, useEffect, useId, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { ConfirmDialog } from '@/components/common';
import { PageContainer } from '@/components/layout';

import { ArtworkFieldChips } from './ArtworkFieldChips';
import { ArtworkImageField } from './ArtworkImageField';
import {
  MAX_ARTWORK_FIELDS,
  MAX_ARTWORK_IMAGE_MB,
  MAX_ARTWORK_IMAGES,
  MAX_ARTWORK_INTRO_LENGTH,
  MAX_ARTWORK_MATERIAL_LENGTH,
  MAX_ARTWORK_SIZE_LENGTH,
  MAX_ARTWORK_TITLE_LENGTH,
  MAX_PROCESS_IMAGES,
} from './artworkRegister.constants';
import {
  artworkRegisterSchema,
  type ArtworkRegisterValues,
  sanitizeArtworkYearInput,
} from './artworkRegister.schema';
import { ArtworkRegisterCta } from './ArtworkRegisterCta';
import { ArtworkRegisterHeader } from './ArtworkRegisterHeader';
import type { ArtworkImageUrls } from './artworkRequest';
import { useArtworkImageUploads } from './useArtworkImageUploads';
import { useLeaveArtworkRegister } from './useLeaveArtworkRegister';

const LABEL_CLASS = 'typography-body-lg-semibold text-primary';
const OPTIONAL_CLASS = 'typography-body-md-medium text-secondary';
const UNDERLINE_CLASS =
  'border-b border-primary py-3 transition duration-fast ease-standard focus-within:border-interactive-primary';
const INPUT_CLASS =
  'typography-body-xl-regular w-full bg-transparent text-primary outline-none placeholder:text-tertiary';
const REQUIRED_MARK = (
  <span aria-hidden="true" className="typography-body-lg-semibold text-error">
    *
  </span>
);
const OPTIONAL_MARK = <span className={OPTIONAL_CLASS}>· 선택</span>;

export interface ArtworkRegisterFormProps {
  mode: 'create' | 'edit';
  defaultValues: ArtworkRegisterValues;
  initialImages: ArtworkImageUrls;
  /** 작가 영역. 개인 작품은 작가가 항상 나라서 비운다 */
  authorSection?: ReactNode;
  /** 작가 영역에서 바뀐 값이 있는지(공동 작가 추가 등). 나가기 확인에 쓴다 */
  hasExtraChanges?: boolean;
  /** 작가 정보처럼 폼 밖의 값이 아직 준비되지 않았으면 false */
  isReady?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: ArtworkRegisterValues, images: ArtworkImageUrls) => void;
  /** 돌아갈 화면 기록이 없을 때 이동할 경로 */
  leaveFallback: string;
}

export function ArtworkRegisterForm({
  mode,
  defaultValues,
  initialImages,
  authorSection,
  hasExtraChanges = false,
  isReady = true,
  isSubmitting,
  onSubmit,
  leaveFallback,
}: ArtworkRegisterFormProps) {
  const leave = useLeaveArtworkRegister();
  const formId = useId();
  const infoHeadingId = useId();
  const fieldLabelId = useId();
  const isEdit = mode === 'edit';
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const artworkImages = useArtworkImageUploads({
    initialUrls: initialImages.artworkUrls,
    maxImages: MAX_ARTWORK_IMAGES,
  });
  const processImages = useArtworkImageUploads({
    initialUrls: initialImages.processUrls,
    maxImages: MAX_PROCESS_IMAGES,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ArtworkRegisterValues>({
    resolver: zodResolver(artworkRegisterSchema),
    mode: 'onChange',
    defaultValues,
  });
  const values = useWatch({ control });

  const hasInput =
    artworkImages.items.length > 0 ||
    processImages.items.length > 0 ||
    hasExtraChanges ||
    Boolean(
      values.title ||
      values.intro ||
      values.fieldLabels?.length ||
      values.year ||
      values.material ||
      values.size,
    );
  const isUploading = artworkImages.isUploading || processImages.isUploading;
  const canSubmit =
    isReady && isValid && artworkImages.uploadedUrls.length > 0 && !isUploading && !isSubmitting;

  useEffect(() => {
    if (isEdit || !hasInput) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [hasInput, isEdit]);

  // 프로토타입: 등록은 입력한 내용이 있을 때만, 수정은 항상 나갈지 묻는다
  const handleBack = () => {
    if (isEdit || hasInput) {
      setIsLeaveOpen(true);
      return;
    }

    leave(leaveFallback);
  };

  const yearInput = register('year');

  const submit = handleSubmit((data) => {
    if (!canSubmit) return;

    onSubmit(data, {
      artworkUrls: artworkImages.uploadedUrls,
      processUrls: processImages.uploadedUrls,
    });
  });

  return (
    <PageContainer variant="form" className="bg-primary-white">
      <ArtworkRegisterHeader title={isEdit ? '작품 수정' : '작품 등록'} onBack={handleBack} />

      <div className="flex-1 pt-5">
        <form
          id={formId}
          noValidate
          autoComplete="off"
          onSubmit={submit}
          className="flex flex-col gap-10 pb-6"
        >
          {authorSection}

          <section aria-labelledby={infoHeadingId} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 id={infoHeadingId} className="typography-body-xl-semibold text-primary">
                작품 정보
              </h2>
              <ArtworkImageField
                label="작품 이미지"
                required
                help={`첫 번째 사진이 대표 이미지예요\nJPG, PNG, WEBP · 장당 최대 ${MAX_ARTWORK_IMAGE_MB}MB`}
                addLabel="사진 추가"
                uploads={artworkImages}
                representative
                limitMessage={`작품 이미지는 최대 ${MAX_ARTWORK_IMAGES}장까지 올릴 수 있어요`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-title`} className="flex items-center gap-1">
                <span className={LABEL_CLASS}>작품명</span>
                {REQUIRED_MARK}
              </label>
              <div className={UNDERLINE_CLASS}>
                <input
                  id={`${formId}-title`}
                  maxLength={MAX_ARTWORK_TITLE_LENGTH}
                  placeholder="입력해 주세요"
                  className={INPUT_CLASS}
                  {...register('title')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-intro`} className="flex items-center gap-1">
                  <span className={LABEL_CLASS}>작품 설명</span>
                  {OPTIONAL_MARK}
                </label>
                <p className={OPTIONAL_CLASS}>작품의 주제나 제작 의도를 소개해주세요</p>
              </div>
              <textarea
                id={`${formId}-intro`}
                maxLength={MAX_ARTWORK_INTRO_LENGTH}
                placeholder="입력해 주세요"
                className="typography-body-xl-regular h-32 w-full resize-none rounded-12 border border-primary bg-primary-white p-4 text-primary outline-none transition duration-fast ease-standard placeholder:text-tertiary focus:border-interactive-primary"
                {...register('intro')}
              />
              <p className="typography-body-md-medium text-right text-tertiary tabular-nums">
                {values.intro?.length ?? 0} / {MAX_ARTWORK_INTRO_LENGTH}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div id={fieldLabelId} className="flex items-center gap-1">
                  <span className={LABEL_CLASS}>작품분야</span>
                  {REQUIRED_MARK}
                </div>
                <p aria-live="polite" className="typography-body-md-medium text-secondary">
                  {values.fieldLabels?.length ?? 0}/{MAX_ARTWORK_FIELDS}
                </p>
              </div>
              <Controller
                control={control}
                name="fieldLabels"
                render={({ field }) => (
                  <ArtworkFieldChips
                    labelId={fieldLabelId}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={`${formId}-year`} className="flex items-center gap-1">
                  <span className={LABEL_CLASS}>제작 연도</span>
                  {REQUIRED_MARK}
                </label>
                <div className={UNDERLINE_CLASS}>
                  <input
                    id={`${formId}-year`}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder={String(new Date().getFullYear())}
                    className={INPUT_CLASS}
                    {...yearInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      event.target.value = sanitizeArtworkYearInput(event.target.value);
                      void yearInput.onChange(event);
                    }}
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={`${formId}-material`} className="flex items-center gap-1">
                  <span className={LABEL_CLASS}>재료 / 매체</span>
                  {REQUIRED_MARK}
                </label>
                <div className={UNDERLINE_CLASS}>
                  <input
                    id={`${formId}-material`}
                    maxLength={MAX_ARTWORK_MATERIAL_LENGTH}
                    placeholder="입력해 주세요"
                    className={INPUT_CLASS}
                    {...register('material')}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-size`} className="flex items-center gap-1">
                <span className={LABEL_CLASS}>규격</span>
                {OPTIONAL_MARK}
              </label>
              <div className={UNDERLINE_CLASS}>
                <input
                  id={`${formId}-size`}
                  maxLength={MAX_ARTWORK_SIZE_LENGTH}
                  placeholder="90 × 120 cm"
                  className={INPUT_CLASS}
                  {...register('size')}
                />
              </div>
            </div>

            <ArtworkImageField
              label="작업 과정"
              help="작품을 만든 과정을 보여주는 사진을 추가해요"
              addLabel="사진 추가"
              uploads={processImages}
              limitMessage={`작업 과정 사진은 최대 ${MAX_PROCESS_IMAGES}장까지 올릴 수 있어요`}
            />
          </section>
        </form>
      </div>

      <ArtworkRegisterCta>
        <button
          form={formId}
          type="submit"
          disabled={!canSubmit}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
        >
          {isEdit ? '수정 완료' : '작품 등록'}
        </button>
      </ArtworkRegisterCta>

      <ConfirmDialog
        open={isLeaveOpen}
        title={isEdit ? '작품 수정을 나갈까요?' : '작품 등록을 나갈까요?'}
        description={isEdit ? '수정한 내용은 저장되지 않아요' : '입력한 내용은 저장되지 않아요'}
        confirmLabel="나가기"
        cancelLabel={isEdit ? '계속 수정' : '계속 작성'}
        onCancel={() => setIsLeaveOpen(false)}
        onConfirm={() => leave(leaveFallback, { overlayOpen: true })}
      />
    </PageContainer>
  );
}
