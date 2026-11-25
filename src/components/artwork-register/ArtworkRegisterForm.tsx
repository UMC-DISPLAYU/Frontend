import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { type BlockerFunction, useBlocker } from 'react-router-dom';

import { ConfirmDialog } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { ArtworkFieldChips } from './ArtworkFieldChips';
import { ArtworkImageField } from './ArtworkImageField';
import { ArtworkPartFields } from './ArtworkPartFields';
import {
  countPartMedia,
  createArtworkPartValues,
  getPartMediaLimit,
  isAnyPartUploading,
  toPartUploads,
} from './artworkParts';
import {
  MAX_ARTWORK_FIELDS,
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
import {
  BIG_BUTTON_CLASS,
  HELP_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  OPTIONAL_CLASS,
  REQUIRED_CLASS,
  UNDERLINE_CLASS,
} from './artworkRegister.styles';
import { ArtworkRegisterCta } from './ArtworkRegisterCta';
import { ArtworkRegisterHeader } from './ArtworkRegisterHeader';
import { PlusIcon } from './ArtworkRegisterIcons';
import type { ArtworkImageUrls } from './artworkRequest';
import { useArtworkImageUploads } from './useArtworkImageUploads';
import { useLeaveArtworkRegister } from './useLeaveArtworkRegister';

const REQUIRED_MARK = (
  <span aria-hidden="true" className={REQUIRED_CLASS}>
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
  /** 작품 이미지에 영상을 받는지. 전시 작품만 받는다(개인 작품 API 는 영상 필드가 없다) */
  allowVideo?: boolean;
  /** 작품 추가(연작)를 받는지. 전시 작품만 받는다(개인 작품 API 는 parts 가 없다) */
  allowParts?: boolean;
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
  allowVideo = false,
  allowParts = false,
}: ArtworkRegisterFormProps) {
  const leave = useLeaveArtworkRegister();
  const formId = useId();
  const infoHeadingId = useId();
  const fieldLabelId = useId();
  const isEdit = mode === 'edit';
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<ArtworkRegisterValues>({
    resolver: zodResolver(artworkRegisterSchema),
    mode: 'onChange',
    defaultValues,
  });
  const values = useWatch({ control });
  const partFields = useFieldArray({ control, name: 'parts' });
  const parts = useWatch({ control, name: 'parts' });
  const partMediaCount = countPartMedia(parts);

  // 사진 · 영상은 모든 작품을 합쳐 10개라서, 작품 1 칸도 다른 작품에 올린 수만큼 덜 받는다
  const artworkImages = useArtworkImageUploads({
    initialUrls: initialImages.artworkUrls,
    initialCrop: initialImages.artworkCrop,
    initialFit: initialImages.artworkFit,
    initialVideos: initialImages.videos,
    maxImages: MAX_ARTWORK_IMAGES - partMediaCount,
    allowVideo,
    representative: true,
  });
  const mediaCount = artworkImages.items.length + partMediaCount;
  const mediaCountLabel = { current: mediaCount, max: MAX_ARTWORK_IMAGES };
  const isMultiPart = partFields.fields.length > 0;
  // 저장된 작품 칸만 처음 사진을 불러오고, 작품 추가로 만든 칸은 나타날 때 그 칸으로 스크롤한다
  const savedPartUrls = new Map(
    defaultValues.parts.map((part, index) => [part.key, initialImages.partUrls?.[index] ?? []]),
  );
  const processImages = useArtworkImageUploads({
    initialUrls: initialImages.processUrls,
    maxImages: MAX_PROCESS_IMAGES,
    videoNotAllowedMessage: allowVideo ? '작업 과정에는 사진만 올릴 수 있어요' : undefined,
    // 프로토타입은 작업 과정 칸의 오류를 칸 위 안내 대신 토스트로 알린다
    onUploadError: () => toast('작업 과정 사진을 올리지 못했어요. 다시 시도해주세요.'),
  });

  const hasInput =
    artworkImages.items.length > 0 ||
    processImages.items.length > 0 ||
    parts.length > 0 ||
    hasExtraChanges ||
    Boolean(
      values.title ||
      values.intro ||
      values.fieldLabels?.length ||
      values.year ||
      values.material ||
      values.size,
    );
  const isUploading =
    artworkImages.isUploading || processImages.isUploading || isAnyPartUploading(parts);
  const canSubmit =
    isReady && isValid && artworkImages.uploadedUrls.length > 0 && !isUploading && !isSubmitting;

  const shouldWarnLeave = !isEdit && hasInput;
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!shouldWarnLeave) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [shouldWarnLeave]);

  /*
   * 프로토타입은 페이지가 바뀌어 브라우저 뒤로가기에도 이탈 경고가 뜬다. SPA 에서는 beforeunload 가 없으므로
   * 다른 화면으로 가는 이동을 막고 나가기 확인을 띄운다. 오버레이(같은 경로) 기록 이동은 막지 않는다
   */
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      shouldWarnLeave &&
      !allowLeaveRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [shouldWarnLeave],
  );
  const blocker = useBlocker(shouldBlock);

  // 막은 이동은 되돌리고(reset) 머문 화면에서 나가기 확인을 연다. 확인 모달이 연 기록을 나가기가 함께 정리한다
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    blocker.reset();
    // 저장 중에는 확인 모달을 열지 않는다(저장이 끝나면 화면이 바뀐다)
    if (!isSubmitting) queueMicrotask(() => setIsLeaveOpen(true));
  }, [blocker, isSubmitting]);

  const leaveNow: typeof leave = (...args) => {
    allowLeaveRef.current = true;
    leave(...args);
  };

  // 프로토타입: 등록은 입력한 내용이 있을 때만, 수정은 항상 나갈지 묻는다
  const handleBack = () => {
    // 저장 중에 확인 모달을 열면 저장 후 이동이 모달 기록만 닫고 이 화면에 남는다
    if (isSubmitting) return;

    if (isEdit || hasInput) {
      setIsLeaveOpen(true);
      return;
    }

    leaveNow(leaveFallback);
  };

  const yearInput = register('year');

  const addPart = () => {
    // 사진 없이는 작품을 올릴 수 없어서, 다 찼으면 새 칸을 만들지 않는다(프로토타입)
    if (mediaCount >= MAX_ARTWORK_IMAGES) {
      toast(`작품 이미지는 최대 ${MAX_ARTWORK_IMAGES}장까지 올릴 수 있어요`);
      return;
    }
    partFields.append(createArtworkPartValues(values.year ?? ''), { shouldFocus: false });
  };

  const submit = handleSubmit((data) => {
    if (!canSubmit) return;

    const partUploads = toPartUploads(data.parts);

    onSubmit(data, {
      artworkUrls: artworkImages.uploadedUrls,
      processUrls: processImages.uploadedUrls,
      artworkCrop: artworkImages.items[0]?.crop ?? null,
      artworkFit: artworkImages.representativeFit,
      ...(allowVideo && { videos: { ...artworkImages.uploadedVideos, ...partUploads.videos } }),
      ...(allowParts && { partUrls: partUploads.partUrls }),
    });
  });

  return (
    <PageContainer variant="form" className="bg-primary-white">
      <ArtworkRegisterHeader title={isEdit ? '작품 수정' : '작품 등록'} onBack={handleBack} />

      <form
        id={formId}
        noValidate
        autoComplete="off"
        onSubmit={submit}
        className="flex flex-1 flex-col"
      >
        <div className="flex-1">
          {authorSection}

          <section aria-labelledby={infoHeadingId} className="mt-10">
            <h2 id={infoHeadingId} className="typography-body-xl-semibold text-primary">
              작품 정보
            </h2>
            {/* 프로토타입 U-191: 작품을 더했을 때만 "작품 1" 제목을 둔다 */}
            {isMultiPart && (
              <h3 className="typography-body-xl-semibold mt-4 text-primary">작품 1</h3>
            )}
            <ArtworkImageField
              className={isMultiPart ? 'mt-3' : 'mt-4'}
              label="작품 이미지"
              required
              help="첫 번째 사진이 대표 이미지예요"
              addLabel={allowVideo ? '사진·영상 추가' : '사진 추가'}
              uploads={artworkImages}
              representative
              count={mediaCountLabel}
              limitMessage={`작품 이미지는 최대 ${MAX_ARTWORK_IMAGES}장까지 올릴 수 있어요`}
            />

            <div className="mt-6">
              <label htmlFor={`${formId}-title`} className={LABEL_CLASS}>
                <span>
                  작품명
                  {REQUIRED_MARK}
                </span>
              </label>
              <div className={UNDERLINE_CLASS}>
                <input
                  id={`${formId}-title`}
                  maxLength={MAX_ARTWORK_TITLE_LENGTH}
                  placeholder="입력해주세요"
                  className={INPUT_CLASS}
                  {...register('title')}
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor={`${formId}-intro`} className={LABEL_CLASS}>
                <span>작품 설명 {OPTIONAL_MARK}</span>
              </label>
              {isMultiPart && <p className={HELP_CLASS}>모든 작품에 함께 보여요</p>}
              <textarea
                id={`${formId}-intro`}
                maxLength={MAX_ARTWORK_INTRO_LENGTH}
                placeholder="입력해주세요"
                className="typography-body-xl-regular mt-2 block h-32 w-full resize-none rounded-12 border border-primary bg-primary-white px-4 py-3.5 text-primary outline-none transition-colors duration-fast ease-standard placeholder:text-tertiary focus:border-[#18181b]"
                {...register('intro')}
              />
              <p className="typography-body-md-medium mt-2 text-right text-tertiary tabular-nums">
                {values.intro?.length ?? 0} / {MAX_ARTWORK_INTRO_LENGTH}
              </p>
            </div>

            <div className="mt-6">
              <div className="typography-body-lg-semibold flex items-center gap-1 text-primary">
                <span id={fieldLabelId}>
                  작품분야
                  {REQUIRED_MARK}
                </span>
                <span
                  aria-live="polite"
                  className="typography-body-md-medium ml-auto text-secondary tabular-nums"
                >
                  {values.fieldLabels?.length ?? 0}/{MAX_ARTWORK_FIELDS}
                </span>
              </div>
              {isMultiPart && <p className={cn(HELP_CLASS, 'mt-0')}>모든 작품에 함께 적용돼요</p>}
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

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="min-w-0">
                <label htmlFor={`${formId}-year`} className={LABEL_CLASS}>
                  <span>
                    제작 연도
                    {REQUIRED_MARK}
                  </span>
                </label>
                <div className={UNDERLINE_CLASS}>
                  <input
                    id={`${formId}-year`}
                    type="text"
                    // 모바일에서 문자 키보드 대신 숫자 키패드를 띄운다(iOS 는 pattern 도 함께 봐야 숫자 키패드가 뜬다)
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    maxLength={4}
                    placeholder="YYYY"
                    className={INPUT_CLASS}
                    {...yearInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      event.target.value = sanitizeArtworkYearInput(event.target.value);
                      void yearInput.onChange(event);
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor={`${formId}-material`} className={LABEL_CLASS}>
                  <span>재료 / 매체 {OPTIONAL_MARK}</span>
                </label>
                <div className={UNDERLINE_CLASS}>
                  <input
                    id={`${formId}-material`}
                    maxLength={MAX_ARTWORK_MATERIAL_LENGTH}
                    placeholder="입력해주세요"
                    className={INPUT_CLASS}
                    {...register('material')}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor={`${formId}-size`} className={LABEL_CLASS}>
                <span>규격 {OPTIONAL_MARK}</span>
              </label>
              <div className={UNDERLINE_CLASS}>
                <input
                  id={`${formId}-size`}
                  maxLength={MAX_ARTWORK_SIZE_LENGTH}
                  placeholder="입력해주세요"
                  className={INPUT_CLASS}
                  {...register('size')}
                />
              </div>
            </div>

            {allowParts && (
              <>
                {partFields.fields.map((field, index) => (
                  <ArtworkPartFields
                    key={field.id}
                    index={index}
                    register={register}
                    setValue={setValue}
                    initialUrls={savedPartUrls.get(field.key) ?? []}
                    initialVideos={initialImages.videos}
                    maxImages={getPartMediaLimit(
                      parts[index]?.media?.length ?? 0,
                      mediaCount,
                      MAX_ARTWORK_IMAGES,
                    )}
                    totalCount={mediaCount}
                    allowVideo={allowVideo}
                    scrollOnMount={!savedPartUrls.has(field.key)}
                    onRemove={() => partFields.remove(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addPart}
                  className="typography-body-lg-semibold mt-6 flex w-full items-center gap-2 border-t border-bg-secondary py-4 text-left text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                >
                  <PlusIcon className="size-5" />
                  작품 추가
                  <span className={OPTIONAL_CLASS}>· 선택</span>
                </button>
                <p className={cn(HELP_CLASS, 'mt-0')}>
                  작가와 작품 설명이 같은 작품을 한 페이지에 함께 올려요
                  <br />
                  검색과 작품 카드에는 첫 번째 작품의 작품명이 보여요
                </p>
              </>
            )}

            <ArtworkImageField
              className="mt-6"
              label="작업 과정"
              help="작품을 만든 과정을 보여주는 사진을 추가해요"
              addLabel="사진 추가"
              uploads={processImages}
              limitMessage={`작업 과정 사진은 최대 ${MAX_PROCESS_IMAGES}장까지 올릴 수 있어요`}
            />
          </section>
        </div>

        <ArtworkRegisterCta>
          <button type="submit" disabled={!canSubmit} className={BIG_BUTTON_CLASS}>
            {isEdit ? '수정 완료' : '작품 등록'}
          </button>
        </ArtworkRegisterCta>
      </form>

      <ConfirmDialog
        open={isLeaveOpen}
        title={isEdit ? '작품 수정을 나갈까요?' : '작품 등록을 나갈까요?'}
        description={isEdit ? '수정한 내용은 저장되지 않아요' : '입력한 내용은 저장되지 않아요'}
        confirmLabel="나가기"
        cancelLabel={isEdit ? '계속 수정' : '계속 작성'}
        onCancel={() => setIsLeaveOpen(false)}
        onConfirm={() => leaveNow(leaveFallback, { overlayOpen: true })}
      />
    </PageContainer>
  );
}
