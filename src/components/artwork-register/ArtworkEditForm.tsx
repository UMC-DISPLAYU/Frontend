import { type ReactNode, useId, useRef } from 'react';

import EditCloseIcon from '@/assets/exhibition-work/EditCloseIcon.svg';
import EditPlusIcon from '@/assets/exhibition-work/EditPlusIcon.svg';
import { BottomButton } from '@/components/common';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { PageContainer } from '@/components/layout';
import { ChipGroup } from '@/components/ui';
import { ARTWORK_FIELD_MAP } from '@/constants';
import { MAX_ARTWORK_PROGRESS_IMAGES, MAX_ARTWORK_UPLOAD_IMAGES } from '@/constants/exhibition';
import type { ImageUploadItem } from '@/hooks/useImageUpload';
import { sanitizeArtworkRegisterYearInput } from '@/pages/artwork-register/artworkRegister.schema';

import type { RegisterArtworkPageProps } from './RegisterArtworkPage';

const inputClassName =
  'typography-body-lg-medium min-h-11 w-full border-b border-primary bg-primary-white px-3 py-3 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

function FieldLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="typography-body-lg-semibold text-primary">
      {children}
      {required ? (
        <span className="ml-1 text-error">*</span>
      ) : (
        <span className="typography-body-lg-medium text-tertiary"> · 선택</span>
      )}
    </label>
  );
}

function EditTextarea({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={1500}
        placeholder={placeholder}
        className="typography-body-lg-medium block min-h-32 w-full resize-y rounded-12 border border-primary bg-primary-white p-3 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      <p className="typography-body-md-medium mt-1 text-right text-tertiary">{value.length}/1500</p>
    </div>
  );
}

function EditImages({
  images,
  maxImages,
  label,
  thumbnail = false,
  onAdd,
  onRemove,
}: {
  images: ImageUploadItem[];
  maxImages: number;
  label: string;
  thumbnail?: boolean;
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label={`${label} 파일 선택`}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) onAdd(event.target.files);
          event.target.value = '';
        }}
      />
      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={`${label} 추가`}
          className="flex h-30 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-12 border border-primary bg-primary-white text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          <img src={EditPlusIcon} alt="" className="size-6" />
          <span className="typography-body-md-medium">사진 추가</span>
        </button>
      )}
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative h-30 w-24 shrink-0 overflow-hidden rounded-12 bg-primary-black"
        >
          <OptimizedImage
            src={image.previewUrl}
            alt={`${label} ${index + 1}`}
            displayWidth={96}
            skeleton
            frameClassName="h-full w-full"
            className="object-contain"
          />
          <button
            type="button"
            aria-label={`${label} ${index + 1} 삭제`}
            onClick={() => onRemove(image.id)}
            className="absolute right-0 top-0 flex size-11 items-start justify-end rounded-12 p-1 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            <span className="flex size-6 items-center justify-center rounded-circle bg-primary-white">
              <img src={EditCloseIcon} alt="" className="size-4" />
            </span>
          </button>
          {thumbnail && index === 0 && (
            <span className="typography-body-sm-semibold absolute bottom-1 left-1 rounded-4 bg-primary-black px-1.5 py-0.5 text-interactive-inverse">
              대표 사진
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** 수정 화면만 새 레이아웃을 사용하고, 입력·검증·업로드·저장은 기존 등록 폼에 위임한다. */
export function ArtworkEditForm(props: RegisterArtworkPageProps) {
  const id = useId();
  const selectedFields = props.field
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary">
      {props.headerContent}
      <main className="flex flex-col gap-10 pb-6">
        {props.authorContent}
        <section className="flex flex-col gap-6" aria-labelledby={`${id}-heading`}>
          <h2 id={`${id}-heading`} className="typography-body-xl-semibold">
            작품 정보
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel required>작품 이미지</FieldLabel>
              <span className="typography-body-md-medium text-tertiary">
                {props.artworkImages.length}/{MAX_ARTWORK_UPLOAD_IMAGES}
              </span>
            </div>
            <p className="typography-body-md-medium text-tertiary">
              첫 번째 사진이 대표 이미지예요. JPG, PNG, WEBP, GIF 파일을 올릴 수 있어요.
            </p>
            <EditImages
              images={props.artworkImages}
              maxImages={MAX_ARTWORK_UPLOAD_IMAGES}
              label="작품 이미지"
              thumbnail
              onAdd={props.onAddArtworkImages}
              onRemove={props.onRemoveArtworkImage}
            />
            <p className="typography-body-md-medium text-tertiary">
              가로로 밀어서 더 볼 수 있어요.
              <br />
              비율이 다른 사진은 검정 배경으로 채워서 전체가 보여요.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel required htmlFor={`${id}-title`}>
              작품명
            </FieldLabel>
            <input
              id={`${id}-title`}
              value={props.title}
              onChange={(event) => props.onChangeTitle(event.target.value)}
              placeholder="작품명을 입력해주세요"
              className={inputClassName}
              aria-invalid={Boolean(props.titleError)}
              aria-describedby={props.titleError ? `${id}-title-error` : undefined}
            />
            {props.titleError && (
              <p id={`${id}-title-error`} className="typography-body-md-medium text-error">
                {props.titleError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor={`${id}-description`}>작품 설명</FieldLabel>
            <p className="typography-body-md-medium text-tertiary">
              관람자에게 작품을 소개해주세요.
            </p>
            <EditTextarea
              id={`${id}-description`}
              value={props.description}
              onChange={props.onChangeDescription}
              placeholder="작품에 대해 소개해주세요"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <FieldLabel required>작품분야</FieldLabel>
              <span className="typography-body-md-medium text-tertiary">
                {selectedFields.length}/2
              </span>
            </div>
            <ChipGroup
              options={Object.keys(ARTWORK_FIELD_MAP)}
              selected={selectedFields}
              onChange={(next) => props.onChangeField(next.join(', '))}
              maxSelect={2}
              aria-label="작품분야"
              className="grid grid-cols-4 gap-2 [&_button]:typography-body-lg-medium [&_button]:min-h-11 [&_button]:rounded-8 [&_button]:border [&_button]:border-primary [&_button]:bg-primary-white [&_button]:px-1 [&_button]:text-secondary [&_button]:outline-none [&_button]:duration-fast [&_button]:ease-standard [&_button]:hover:bg-secondary [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-focus [&_button:active]:scale-99 [&_button[aria-checked=true]]:border-interactive-selected [&_button[aria-checked=true]]:bg-interactive-selected [&_button[aria-checked=true]]:text-interactive-inverse [&_button[aria-checked=true]]:hover:bg-interactive-primary-hover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <FieldLabel required htmlFor={`${id}-year`}>
                제작 연도
              </FieldLabel>
              <input
                id={`${id}-year`}
                {...props.yearInputProps}
                inputMode="numeric"
                maxLength={4}
                value={props.year}
                onChange={(event) => {
                  event.target.value = sanitizeArtworkRegisterYearInput(event.target.value);
                  void props.yearInputProps.onChange(event);
                }}
                placeholder="2026"
                className={inputClassName}
                aria-invalid={Boolean(props.yearError)}
                aria-describedby={props.yearError ? `${id}-year-error` : undefined}
              />
              {props.yearError && (
                <p id={`${id}-year-error`} className="typography-body-md-medium text-error">
                  {props.yearError}
                </p>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <FieldLabel required htmlFor={`${id}-medium`}>
                재료 / 매체
              </FieldLabel>
              <input
                id={`${id}-medium`}
                value={props.medium}
                onChange={(event) => props.onChangeMedium(event.target.value)}
                placeholder="아크릴, 캔버스"
                className={inputClassName}
                aria-invalid={Boolean(props.mediumError)}
                aria-describedby={props.mediumError ? `${id}-medium-error` : undefined}
              />
              {props.mediumError && (
                <p id={`${id}-medium-error`} className="typography-body-md-medium text-error">
                  {props.mediumError}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor={`${id}-size`}>규격</FieldLabel>
            <input
              id={`${id}-size`}
              value={props.size}
              onChange={(event) => props.onChangeSize(event.target.value)}
              placeholder="90 × 120 cm"
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>작업과정</FieldLabel>
              <span className="typography-body-md-medium text-tertiary">
                {props.processImages.length}/{MAX_ARTWORK_PROGRESS_IMAGES}
              </span>
            </div>
            <EditImages
              images={props.processImages}
              maxImages={MAX_ARTWORK_PROGRESS_IMAGES}
              label="작업과정 이미지"
              onAdd={props.onAddProcessImages}
              onRemove={props.onRemoveProcessImage}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor={`${id}-point`}>감상 포인트</FieldLabel>
            <p className="typography-body-md-medium text-tertiary">
              관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요.
            </p>
            <EditTextarea
              id={`${id}-point`}
              value={props.point}
              onChange={props.onChangePoint}
              placeholder="감상 포인트를 입력해주세요"
            />
          </div>
        </section>
        {props.qnaContent}
        {props.submitError && (
          <p role="alert" className="typography-body-lg-medium text-error">
            {props.submitError}
          </p>
        )}
      </main>
      <BottomButton
        inPageContainer
        disabled={!props.canProceed}
        onClick={props.onNext}
        className="typography-body-lg-semibold bg-interactive-primary text-interactive-inverse duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:bg-disable disabled:text-disable"
      >
        {props.isSubmitting ? '수정 중…' : '수정 완료'}
      </BottomButton>
    </PageContainer>
  );
}
