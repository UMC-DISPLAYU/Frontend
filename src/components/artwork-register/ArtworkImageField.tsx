import { type ChangeEvent, useId, useRef, useState } from 'react';

import CloseIcon from '@/assets/display-register/CloseIcon.svg';
import PlusIcon from '@/assets/display-register/PlusIcon.svg';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { ARTWORK_IMAGE_ACCEPT_TYPES } from './artworkRegister.constants';
import type { ArtworkImageItem, ArtworkImageUploads } from './useArtworkImageUploads';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

interface ArtworkImageFieldProps {
  label: string;
  required?: boolean;
  help: string;
  addLabel: string;
  uploads: ArtworkImageUploads;
  /** 작품 이미지: 첫 장을 대표 사진으로 표시하고, 실패 · 형식 오류를 칸 위 안내로 보여준다 */
  representative?: boolean;
  limitMessage: string;
}

function UploadErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex items-center gap-3 rounded-12 bg-error-subtle px-4 py-3.5">
      <span
        aria-hidden="true"
        className="typography-body-lg-semibold flex size-6 shrink-0 items-center justify-center rounded-circle bg-notice text-interactive-inverse"
      >
        !
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="typography-body-lg-semibold text-error">업로드하지 못했어요</p>
        <p className="typography-body-md-medium text-secondary">
          네트워크 상태를 확인하고 다시 시도해주세요
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'typography-body-md-semibold relative ml-auto h-8 shrink-0 rounded-8 bg-primary-white px-3 text-primary transition duration-fast ease-standard after:absolute after:-inset-1.5 hover:bg-secondary active:scale-99',
          FOCUS_CLASS,
        )}
      >
        다시 시도
      </button>
    </div>
  );
}

function ImageTile({
  item,
  index,
  isRepresentative,
  onRemove,
}: {
  item: ArtworkImageItem;
  index: number;
  isRepresentative: boolean;
  onRemove: () => void;
}) {
  const isUploading = !item.uploadedUrl;

  return (
    <div
      role="listitem"
      aria-busy={isUploading}
      className="relative h-30 w-24 shrink-0 animate-rise snap-start overflow-hidden bg-secondary"
    >
      <img
        src={item.previewUrl}
        alt={`사진 ${index + 1}`}
        className={cn('size-full object-contain', isUploading && 'opacity-50')}
      />
      {isRepresentative && (
        <span className="typography-body-sm-semibold pointer-events-none absolute bottom-1 left-1 rounded-4 bg-primary-black px-1.5 py-0.5 text-base-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
          대표 사진
        </span>
      )}
      <button
        type="button"
        aria-label={`${index + 1}번째 삭제`}
        onClick={onRemove}
        className={cn('absolute top-0 right-0 flex size-11 justify-end p-1', FOCUS_CLASS)}
      >
        <span className="flex size-6 items-center justify-center rounded-12 bg-primary-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]">
          <img src={CloseIcon} alt="" className="size-4" />
        </span>
      </button>
    </div>
  );
}

/** 카드 썸네일은 사진 가운데를 3:4 로 자른 모습이라, 대표 사진이 어떻게 보이는지 미리 보여준다 */
function CardPreview({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-12 bg-secondary p-3.5">
      <div className="aspect-3/4 w-18 shrink-0 overflow-hidden bg-secondary">
        <img src={imageUrl} alt="" className="size-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="typography-body-lg-semibold text-primary">카드에서는 이렇게 보여요</p>
        <p className="typography-body-md-medium text-secondary">사진 가운데가 카드에 보여요</p>
      </div>
    </div>
  );
}

export function ArtworkImageField({
  label,
  required = false,
  help,
  addLabel,
  uploads,
  representative = false,
  limitMessage,
}: ArtworkImageFieldProps) {
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasRejectedFile, setHasRejectedFile] = useState(false);
  const { items, maxImages } = uploads;
  const representativeImage = representative ? items[0] : undefined;

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const { overLimit, rejectedCount } = uploads.addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';

    // 프로토타입: 작품 이미지는 칸 위 안내로, 작업 과정은 토스트로 알린다
    setHasRejectedFile(representative && rejectedCount > 0);
    if (overLimit) toast(limitMessage);
    else if (rejectedCount > 0 && !representative) toast('올릴 수 없는 파일이에요');
  };

  const handleRetry = () => {
    setHasRejectedFile(false);
    if (!uploads.retry()) openPicker();
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={ARTWORK_IMAGE_ACCEPT_TYPES.join(',')}
        onChange={handleFiles}
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span id={labelId} className="typography-body-lg-semibold text-primary">
            {label}
          </span>
          {required ? (
            <span aria-hidden="true" className="typography-body-lg-semibold text-error">
              *
            </span>
          ) : (
            <span className="typography-body-md-medium text-secondary">· 선택</span>
          )}
          <span
            aria-live="polite"
            className="typography-body-md-medium ml-auto text-secondary tabular-nums"
          >
            {items.length}/{maxImages}
          </span>
        </div>
        <p className="typography-body-md-medium whitespace-pre-line text-secondary">{help}</p>
      </div>
      {representative && (uploads.hasUploadError || hasRejectedFile) && (
        <UploadErrorBox onRetry={handleRetry} />
      )}
      <div
        role="list"
        aria-labelledby={labelId}
        className="-mx-gutter flex snap-x snap-proximity scroll-px-gutter gap-2 overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.length < maxImages && (
          <button
            type="button"
            onClick={openPicker}
            className={cn(
              'flex h-30 w-24 shrink-0 snap-start flex-col items-center justify-center gap-1 border border-primary bg-primary-white transition duration-fast ease-standard hover:bg-secondary active:scale-99',
              FOCUS_CLASS,
            )}
          >
            <img src={PlusIcon} alt="" className="size-6" />
            <span className="typography-body-md-medium text-secondary">{addLabel}</span>
          </button>
        )}
        {items.map((item, index) => (
          <ImageTile
            key={item.id}
            item={item}
            index={index}
            isRepresentative={representative && index === 0}
            onRemove={() => uploads.remove(item.id)}
          />
        ))}
      </div>
      {representativeImage && <CardPreview imageUrl={representativeImage.previewUrl} />}
    </div>
  );
}
