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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { type BlockerFunction, useBlocker } from 'react-router-dom';

import { ConfirmDialog } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { toast } from '@/stores/toastStore';

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
  /** 수정할 때 기존 서버 분야(화면에 없는 분야를 지키고 개수 한도를 맞추는 데 쓴다) */
  previousTypes?: readonly string[];
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
  previousTypes,
}: ArtworkRegisterFormProps) {
  const leave = useLeaveArtworkRegister();
  const formId = useId();
  const infoHeadingId = useId();
  const fieldLabelId = useId();
  const isEdit = mode === 'edit';
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const artworkImages = useArtworkImageUploads({
    initialUrls: initialImages.artworkUrls,
    initialCrop: initialImages.artworkCrop,
    maxImages: MAX_ARTWORK_IMAGES,
  });
  const processImages = useArtworkImageUploads({
    initialUrls: initialImages.processUrls,
    maxImages: MAX_PROCESS_IMAGES,
    // 프로토타입은 작업 과정 칸의 오류를 칸 위 안내 대신 토스트로 알린다
    onUploadError: () => toast('작업 과정 사진을 올리지 못했어요. 다시 시도해주세요.'),
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

  const submit = handleSubmit((data) => {
    if (!canSubmit) return;

    onSubmit(data, {
      artworkUrls: artworkImages.uploadedUrls,
      processUrls: processImages.uploadedUrls,
      artworkCrop: artworkImages.items[0]?.crop ?? null,
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
            <ArtworkImageField
              className="mt-4"
              label="작품 이미지"
              required
              help={`첫 번째 사진이 대표 이미지예요\nJPG, PNG, WEBP, HEIC · 장당 최대 ${MAX_ARTWORK_IMAGE_MB}MB\n영상은 1개까지 · MP4, MOV, WEBM · 3분 이내 · 500MB 이하`}
              addLabel="사진·영상 추가"
              uploads={artworkImages}
              representative
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
              <p className={HELP_CLASS}>작품의 주제나 제작 의도를 소개해주세요</p>
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
              <Controller
                control={control}
                name="fieldLabels"
                render={({ field }) => (
                  <ArtworkFieldChips
                    labelId={fieldLabelId}
                    selected={field.value}
                    previousTypes={previousTypes}
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
