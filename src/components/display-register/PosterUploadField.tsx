import { type ChangeEvent, useRef, useState } from 'react';

import CloseIcon from '@/assets/display-register/CloseIcon.svg';
import PlusIcon from '@/assets/display-register/PlusIcon.svg';
import { MAX_POSTER_UPLOAD_IMAGES } from '@/constants/exhibition';
import { cn } from '@/utils/cn';

import {
  MAX_POSTER_FILE_MB,
  POSTER_ACCEPT_TYPES,
  POSTER_CARD_RATIO,
} from './displayRegister.constants';
import { cropImageStyle } from './posterCrop';
import { PosterCropSheet } from './PosterCropSheet';
import type { PosterItem, PosterUploads } from './usePosterUploads';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
const ADD_TILE_CLASS = cn(
  'flex shrink-0 flex-col items-center justify-center gap-1 rounded-12 border border-primary bg-primary-white transition duration-fast ease-standard hover:bg-secondary active:scale-99',
  FOCUS_CLASS,
);

function PosterHelp() {
  return (
    <p className="typography-body-md-medium text-secondary">
      JPG, PNG, WEBP · 장당 최대 {MAX_POSTER_FILE_MB}MB
      <br />큰 그래픽은 JPG 고화질로 내보내 주세요
    </p>
  );
}

function PosterLabel({ count }: { count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="typography-body-lg-semibold text-primary">전시 포스터</span>
      <span aria-hidden="true" className="typography-body-lg-semibold text-error">
        *
      </span>
      {count !== undefined && (
        <span className="typography-body-md-medium ml-auto text-tertiary">
          {count} / {MAX_POSTER_UPLOAD_IMAGES}
        </span>
      )}
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'typography-body-md-semibold h-11 shrink-0 rounded-8 border border-primary bg-primary-white px-3 text-primary transition duration-fast ease-standard hover:bg-secondary active:scale-99',
        FOCUS_CLASS,
      )}
    >
      다시 시도
    </button>
  );
}

function PosterThumb({
  item,
  index,
  onRemove,
  onAdjust,
}: {
  item: PosterItem;
  index: number;
  onRemove: () => void;
  onAdjust: () => void;
}) {
  const isRepresentative = index === 0;
  const isUploading = !item.uploadedUrl;

  return (
    <div
      aria-busy={isUploading}
      className="relative h-26.25 w-21 shrink-0 overflow-hidden rounded-12 bg-secondary"
    >
      {isRepresentative && item.crop ? (
        // 썸네일(4:5)과 카드(402:568) 비율이 달라, 카드 비율 상자를 가운데 두고 넘치는 위아래를 잘라 보여준다
        <div
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 overflow-hidden"
          style={{ aspectRatio: POSTER_CARD_RATIO }}
        >
          <img
            src={item.previewUrl}
            alt={`포스터 ${index + 1}`}
            style={cropImageStyle(item.crop)}
            className={cn(isUploading && 'opacity-50')}
          />
        </div>
      ) : (
        <img
          src={item.previewUrl}
          alt={`포스터 ${index + 1}`}
          className={cn('size-full object-cover', isUploading && 'opacity-50')}
        />
      )}
      <button
        type="button"
        aria-label={`포스터 ${index + 1} 삭제`}
        onClick={onRemove}
        className={cn('absolute top-0 right-0 flex size-11 justify-end p-1', FOCUS_CLASS)}
      >
        <span className="flex size-6 items-center justify-center rounded-12 bg-primary-white">
          <img src={CloseIcon} alt="" className="size-4" />
        </span>
      </button>
      {isRepresentative && (
        <>
          <span className="typography-body-sm-semibold pointer-events-none absolute bottom-1 left-1 rounded-4 bg-primary-black px-1.5 py-0.5 text-base-white">
            대표
          </span>
          {!isUploading && (
            <button
              type="button"
              aria-label="대표 포스터 카드에 보이는 부분 조정"
              onClick={onAdjust}
              className={cn(
                'absolute right-0 bottom-0 flex h-11 w-12 items-end justify-end p-1',
                FOCUS_CLASS,
              )}
            >
              <span className="typography-body-sm-semibold flex h-5.5 w-9 items-center justify-center rounded-6 bg-primary-white/92 text-primary">
                조정
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function PosterUploadField({ posters }: { posters: PosterUploads }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSession, setCropSession] = useState<{ item: PosterItem; key: number } | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const { items, hasError } = posters;

  const openPicker = () => inputRef.current?.click();
  const handleRetry = () => {
    if (!posters.retry()) openPicker();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    posters.addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const openCrop = (item: PosterItem) => {
    setCropSession((prev) => ({ item, key: (prev?.key ?? 0) + 1 }));
    setIsCropOpen(true);
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      hidden
      multiple
      accept={POSTER_ACCEPT_TYPES.join(',')}
      onChange={handleFiles}
    />
  );

  const cropSheet = cropSession && (
    <PosterCropSheet
      key={cropSession.key}
      open={isCropOpen}
      imageUrl={cropSession.item.previewUrl}
      initialCrop={cropSession.item.crop ?? null}
      onClose={() => setIsCropOpen(false)}
      onDone={(crop) => {
        posters.setCrop(cropSession.item.id, crop);
        setIsCropOpen(false);
      }}
    />
  );

  if (items.length === 0) {
    return (
      <div className="flex items-start gap-4">
        {fileInput}
        {hasError ? (
          <>
            <div
              aria-hidden="true"
              className="typography-title-xs flex h-30 w-24 shrink-0 items-center justify-center rounded-12 bg-error-subtle text-error"
            >
              !
            </div>
            <div role="alert" className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <p className="typography-body-lg-semibold text-error">업로드하지 못했어요</p>
              <p className="typography-body-md-medium text-secondary">
                네트워크 상태를 확인하고 다시 시도해주세요
              </p>
              <div className="pt-1">
                <RetryButton onClick={handleRetry} />
              </div>
            </div>
          </>
        ) : (
          <>
            <button type="button" onClick={openPicker} className={cn(ADD_TILE_CLASS, 'h-30 w-24')}>
              <img src={PlusIcon} alt="" className="size-6" />
              <span className="typography-body-md-medium text-secondary">포스터 업로드</span>
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <PosterLabel />
              <PosterHelp />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {fileInput}
      <div className="flex flex-col gap-1">
        <PosterLabel count={items.length} />
        <PosterHelp />
      </div>
      {hasError && (
        <div role="alert" className="flex items-center gap-3 rounded-12 bg-error-subtle p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="typography-body-lg-semibold text-error">업로드하지 못했어요</p>
            <p className="typography-body-md-medium text-secondary">
              네트워크 상태를 확인하고 다시 시도해주세요
            </p>
          </div>
          <RetryButton onClick={handleRetry} />
        </div>
      )}
      <div className="-mx-gutter flex scroll-px-gutter gap-2 overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length < MAX_POSTER_UPLOAD_IMAGES && (
          <button type="button" onClick={openPicker} className={cn(ADD_TILE_CLASS, 'h-26.25 w-21')}>
            <img src={PlusIcon} alt="" className="size-6" />
            <span className="typography-body-md-medium text-secondary">추가</span>
          </button>
        )}
        {items.map((item, index) => (
          <PosterThumb
            key={item.id}
            item={item}
            index={index}
            onRemove={() => posters.remove(item.id)}
            onAdjust={() => openCrop(item)}
          />
        ))}
      </div>
      {cropSheet}
    </div>
  );
}
