import { type ChangeEvent, useId, useRef, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';

import { VideoThumbnailSheet } from '@/components/common/VideoThumbnailSheet';
import { Loader } from '@/components/ui';
import {
  type ReorderDragMode,
  STOP_REORDER_PROPS,
  useHorizontalReorder,
  useHorizontalReorderItem,
} from '@/hooks/useHorizontalReorder';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { cropImageStyle } from '@/utils/cropBox';
import { formatVideoDuration } from '@/utils/videoFile';

import { ArtworkCropSheet } from './ArtworkCropSheet';
import {
  ARTWORK_IMAGE_ACCEPT_TYPES,
  ARTWORK_VIDEO_ACCEPT_TYPES,
  MAX_ARTWORK_IMAGE_MB,
} from './artworkRegister.constants';
import { FOCUS_CLASS, HELP_CLASS, OPTIONAL_CLASS, REQUIRED_CLASS } from './artworkRegister.styles';
import { CloseIcon, PlusIcon } from './ArtworkRegisterIcons';
import { heicAcceptTokens } from './heicImage';
import {
  type ArtworkImageItem,
  type ArtworkImageUploads,
  isArtworkItemReady,
} from './useArtworkImageUploads';

const CHIP_BUTTON_CLASS = cn(
  'typography-body-sm-semibold absolute right-1 bottom-1 h-5.5 rounded-6 bg-[rgba(255,255,255,0.92)] px-2 text-primary after:absolute after:-inset-x-1 after:-inset-y-2.75',
  FOCUS_CLASS,
);

interface ArtworkImageFieldProps {
  label: string;
  required?: boolean;
  help: string;
  addLabel: string;
  uploads: ArtworkImageUploads;
  /** 작품 이미지: 첫 장을 대표 사진으로 표시하고, 카드 미리보기 · 실패 안내를 보여준다 */
  representative?: boolean;
  limitMessage: string;
  className?: string;
}

function UploadErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mt-3 flex items-center gap-3 rounded-12 bg-[#ffe2e2] px-4 py-3.5">
      <span
        aria-hidden="true"
        className="typography-body-lg-semibold grid size-6 shrink-0 place-items-center rounded-circle bg-[#fb2c36] text-base-white"
      >
        !
      </span>
      <div className="min-w-0">
        <b className="typography-body-lg-semibold block text-error">업로드하지 못했어요</b>
        <span className="typography-body-md-medium block text-secondary">
          네트워크 상태를 확인하고 다시 시도해주세요
        </span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'typography-body-md-semibold relative ml-auto h-8 shrink-0 rounded-8 bg-primary-white px-3 text-primary after:absolute after:-inset-1.5',
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
  dragMode,
  canReorder,
  onRemove,
  onAdjust,
  onChangeThumbnail,
}: {
  item: ArtworkImageItem;
  index: number;
  isRepresentative: boolean;
  dragMode: ReorderDragMode;
  canReorder: boolean;
  onRemove: () => void;
  onAdjust: () => void;
  onChangeThumbnail: () => void;
}) {
  const isVideo = item.mediaType === 'VIDEO';
  const isUploading = !isArtworkItemReady(item);
  const {
    setNodeRef,
    style: reorderStyle,
    className: reorderClassName,
    itemProps: reorderProps,
  } = useHorizontalReorderItem({ id: item.id, dragMode, disabled: !canReorder });

  return (
    <div
      ref={setNodeRef}
      style={reorderStyle}
      aria-busy={isUploading}
      {...reorderProps}
      aria-roledescription="순서를 바꿀 수 있는 사진"
      aria-label={`${isVideo ? '영상' : '사진'} ${index + 1}${isRepresentative ? ', 대표 사진' : ''}`}
      className={cn(
        'relative h-30 w-24 shrink-0 animate-rise snap-start overflow-hidden bg-secondary [animation-duration:350ms] [animation-fill-mode:backwards]',
        reorderClassName,
        FOCUS_CLASS,
      )}
    >
      {item.previewUrl ? (
        <img
          src={item.previewUrl}
          alt=""
          draggable={false}
          className={cn('size-full object-contain', isUploading && 'opacity-50')}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-secondary">
          <Loader label={null} />
        </span>
      )}
      {isVideo && (
        <span className="typography-body-sm-semibold pointer-events-none absolute top-1 left-1 inline-flex h-5 items-center gap-0.75 rounded-4 bg-[rgba(0,0,0,0.72)] pr-1.5 pl-1 text-base-white tabular-nums">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-2.5">
            <path d="M7 4.8v14.4L19 12z" fill="currentColor" />
          </svg>
          {item.duration !== undefined && formatVideoDuration(item.duration)}
        </span>
      )}
      {/* 프로토타입: 영상은 칸마다 썸네일 변경, 사진은 대표 사진만 조정 */}
      {!isUploading && (isVideo || isRepresentative) && (
        <button
          type="button"
          aria-label={isVideo ? '영상 썸네일 변경' : '대표 사진 썸네일 조정'}
          onClick={isVideo ? onChangeThumbnail : onAdjust}
          {...STOP_REORDER_PROPS}
          className={CHIP_BUTTON_CLASS}
        >
          {isVideo ? '썸네일' : '조정'}
        </button>
      )}
      {isRepresentative && (
        <span className="typography-body-sm-semibold pointer-events-none absolute bottom-1 left-1 inline-flex h-5.5 items-center rounded-4 bg-[#000] px-1.5 text-base-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
          대표 사진
        </span>
      )}
      <button
        type="button"
        aria-label={`${index + 1}번째 삭제`}
        onClick={onRemove}
        {...STOP_REORDER_PROPS}
        className={cn(
          'absolute top-1 right-1 grid size-6 place-items-center rounded-12 bg-primary-white text-primary shadow-[0_1px_4px_rgba(0,0,0,0.18)] after:absolute after:-inset-2.5',
          FOCUS_CLASS,
        )}
      >
        <CloseIcon strokeWidth={2.2} className="size-3.5" />
      </button>
    </div>
  );
}

/** 작품 상세의 사진 칸 비율(프로토타입) */
const DETAIL_RATIO = 402 / 554;

/**
 * 대표 사진이 목록 썸네일(3:4)에서 어떻게 잘리는지와 상세에서는 전체가 보인다는 걸 두 칸으로 보여 주고,
 * 썸네일에 보이는 부분을 고르게 한다(프로토타입 U-160)
 */
function ThumbnailPreview({ item, onAdjust }: { item: ArtworkImageItem; onAdjust: () => void }) {
  return (
    <div className="mt-3.5 flex items-start gap-3.5 rounded-12 bg-secondary p-3.5">
      <div aria-hidden="true" className="flex shrink-0 gap-2.5">
        <figure className="grid content-start justify-items-center gap-1">
          <div className="relative aspect-3/4 w-15 overflow-hidden bg-secondary">
            <img
              src={item.previewUrl}
              alt=""
              style={item.crop ? cropImageStyle(item.crop) : undefined}
              className={cn(
                'pointer-events-none select-none',
                !item.crop && 'size-full object-cover',
              )}
            />
          </div>
          <i className="block h-1 w-full rounded-[2px] bg-[#d4d4d8]" />
          <i className="block h-1 w-3/5 justify-self-start rounded-[2px] bg-[#d4d4d8]" />
          <figcaption className="typography-body-sm-medium mt-0.5 text-secondary">목록</figcaption>
        </figure>
        <figure className="grid content-start justify-items-center gap-1">
          <div
            className="grid h-20 place-items-center overflow-hidden bg-[#f0f0f3]"
            style={{ aspectRatio: DETAIL_RATIO }}
          >
            <img
              src={item.previewUrl}
              alt=""
              className="pointer-events-none block max-h-full max-w-full object-contain"
            />
          </div>
          <i className="invisible block h-1 w-full" />
          <i className="invisible block h-1 w-3/5" />
          <figcaption className="typography-body-sm-medium mt-0.5 text-secondary">상세</figcaption>
        </figure>
      </div>
      <div className="typography-body-md-medium grid min-w-0 gap-0.5 text-secondary">
        <b className="typography-body-lg-semibold text-primary">썸네일은 이렇게 보여요</b>
        <span>작품 상세에서는 사진 전체가 보여요</span>
        <button
          type="button"
          onClick={onAdjust}
          className={cn(
            'typography-body-md-semibold mt-2 min-h-9 justify-self-start rounded-circle border border-primary bg-primary-white px-3.5 text-secondary transition-transform duration-fast ease-standard active:scale-96',
            FOCUS_CLASS,
          )}
        >
          썸네일 조정
        </button>
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
  className,
}: ArtworkImageFieldProps) {
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasRejectedFile, setHasRejectedFile] = useState(false);
  const [cropSession, setCropSession] = useState<{ item: ArtworkImageItem; key: number } | null>(
    null,
  );
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [thumbnailSession, setThumbnailSession] = useState<{
    item: ArtworkImageItem;
    key: number;
  } | null>(null);
  const [isThumbnailOpen, setIsThumbnailOpen] = useState(false);
  const { items, maxImages } = uploads;
  // 대표가 영상이면 서버가 썸네일을 그대로 카드에 쓰므로 자르기 미리보기를 두지 않는다
  const representativeImage =
    representative && items[0]?.mediaType === 'IMAGE' ? items[0] : undefined;
  const ids = items.map((item) => item.id);
  const { dragMode, contextProps } = useHorizontalReorder({ onMove: uploads.move });

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const { overLimit, rejectedCount, message } = uploads.addFiles(
      Array.from(event.target.files ?? []),
    );
    event.target.value = '';

    // 프로토타입: 작품 이미지는 칸 위 안내로, 작업 과정은 토스트로 알린다
    setHasRejectedFile(representative && rejectedCount > 0);
    if (overLimit) toast(limitMessage);
    else if (message) toast(message);
    else if (rejectedCount > 0 && !representative) toast('올릴 수 없는 파일이에요');
  };

  const handleRetry = () => {
    setHasRejectedFile(false);
    if (!uploads.retry()) openPicker();
  };

  const openCrop = (item: ArtworkImageItem) => {
    setCropSession((prev) => ({ item, key: (prev?.key ?? 0) + 1 }));
    setIsCropOpen(true);
  };

  const openThumbnail = (item: ArtworkImageItem) => {
    setThumbnailSession((prev) => ({ item, key: (prev?.key ?? 0) + 1 }));
    setIsThumbnailOpen(true);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={[
          ...ARTWORK_IMAGE_ACCEPT_TYPES,
          ...heicAcceptTokens(),
          ...(uploads.allowVideo ? ARTWORK_VIDEO_ACCEPT_TYPES : []),
        ].join(',')}
        onChange={handleFiles}
      />
      <div className="typography-body-lg-semibold flex items-center gap-1 text-primary">
        <span id={labelId}>
          {label}
          {required ? (
            <span aria-hidden="true" className={REQUIRED_CLASS}>
              *
            </span>
          ) : (
            <>
              {' '}
              <span className={OPTIONAL_CLASS}>· 선택</span>
            </>
          )}
        </span>
        <span
          aria-live="polite"
          className="typography-body-md-medium ml-auto text-secondary tabular-nums"
        >
          {items.length}/{maxImages}
        </span>
      </div>
      <p className={cn(HELP_CLASS, 'whitespace-pre-line')}>{help}</p>
      {representative && (uploads.hasUploadError || hasRejectedFile) && (
        <UploadErrorBox onRetry={handleRetry} />
      )}
      <DndContext {...contextProps}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <div
            role="group"
            aria-labelledby={labelId}
            // 프로토타입: 집힌 칸의 그림자 · 커지는 만큼 위아래 12px 여유를 둔다(아래는 -12px 로 자리 유지)
            className={cn(
              '-mx-gutter -mb-3 flex snap-x snap-proximity scroll-px-gutter gap-2 overflow-x-auto px-gutter py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              dragMode && 'snap-none',
            )}
          >
            {items.length < maxImages && (
              <button
                type="button"
                onClick={openPicker}
                className={cn(
                  'typography-body-md-medium grid h-30 w-24 shrink-0 cursor-pointer snap-start place-content-center justify-items-center gap-1 border border-primary text-secondary transition-colors duration-fast hover:bg-secondary',
                  FOCUS_CLASS,
                )}
              >
                <PlusIcon strokeWidth={1.6} className="size-6 text-primary" />
                {addLabel}
              </button>
            )}
            {items.map((item, index) => (
              <ImageTile
                key={item.id}
                item={item}
                index={index}
                isRepresentative={representative && index === 0}
                dragMode={dragMode}
                canReorder={items.length > 1}
                onRemove={() => uploads.remove(item.id)}
                onAdjust={() => openCrop(item)}
                onChangeThumbnail={() => openThumbnail(item)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {representativeImage?.previewUrl && (
        <ThumbnailPreview
          item={representativeImage}
          onAdjust={() => openCrop(representativeImage)}
        />
      )}
      {cropSession && (
        <ArtworkCropSheet
          key={cropSession.key}
          open={isCropOpen}
          imageUrl={cropSession.item.previewUrl}
          initialCrop={cropSession.item.crop ?? null}
          onClose={() => setIsCropOpen(false)}
          onDone={(crop) => {
            uploads.setCrop(cropSession.item.id, crop);
            setIsCropOpen(false);
          }}
        />
      )}
      {thumbnailSession?.item.videoSrc && (
        <VideoThumbnailSheet
          key={thumbnailSession.key}
          open={isThumbnailOpen}
          videoSrc={thumbnailSession.item.videoSrc}
          imageAcceptTypes={ARTWORK_IMAGE_ACCEPT_TYPES}
          maxImageMb={MAX_ARTWORK_IMAGE_MB}
          onClose={() => setIsThumbnailOpen(false)}
          onSelect={(file) => {
            uploads.setThumbnail(thumbnailSession.item.id, file);
            setIsThumbnailOpen(false);
          }}
        />
      )}
    </div>
  );
}
