import { type ChangeEvent, useRef, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';

import { VideoThumbnailSheet } from '@/components/common/VideoThumbnailSheet';
import { Loader } from '@/components/ui';
import { MAX_POSTER_UPLOAD_IMAGES } from '@/constants/exhibition';
import { useFileDrop } from '@/hooks/useFileDrop';
import {
  type ReorderDragMode,
  STOP_REORDER_PROPS,
  useHorizontalReorder,
  useHorizontalReorderItem,
} from '@/hooks/useHorizontalReorder';
import { cn } from '@/utils/cn';
import { formatVideoDuration } from '@/utils/videoFile';

import {
  MAX_POSTER_FILE_MB,
  MAX_POSTER_VIDEO_SECONDS,
  POSTER_ACCEPT_TYPES,
  POSTER_VIDEO_ACCEPT_TYPES,
} from './displayRegister.constants';
import { COUNT_CLASS, FOCUS_CLASS, REQUIRED_CLASS } from './displayRegister.styles';
import { CloseIcon, PlayIcon, PlusIcon } from './DisplayRegisterIcons';
import { PosterCropSheet } from './PosterCropSheet';
import { isPosterReady, type PosterItem, type PosterUploads } from './usePosterUploads';

const ACCEPT = [...POSTER_ACCEPT_TYPES, ...POSTER_VIDEO_ACCEPT_TYPES].join(',');

const CHIP_BUTTON_CLASS = cn(
  'typography-body-sm-semibold absolute right-1.5 bottom-1.5 h-5.5 rounded-6 bg-[rgba(255,255,255,0.92)] px-2 text-primary after:absolute after:-inset-x-1 after:-inset-y-2.75',
  FOCUS_CLASS,
);

const ADD_TILE_CLASS = cn(
  'typography-body-md-medium grid shrink-0 cursor-pointer place-content-center justify-items-center gap-2 border border-primary text-secondary transition-colors duration-fast hover:bg-secondary',
  FOCUS_CLASS,
);

const DROP_ACTIVE_CLASS = 'rounded-12 outline-2 outline-offset-4 outline-focus outline-dashed';

function PosterHelp({ videoLimitMessage }: { videoLimitMessage: string | null }) {
  return (
    <>
      <p className="typography-body-md-medium mt-1 text-secondary">
        JPG, PNG, WEBP, HEIC
        <br />
        (영상은 1개까지 · MP4, MOV, WEBM · {MAX_POSTER_VIDEO_SECONDS}초 이내)
      </p>
      {videoLimitMessage && (
        <p role="alert" className="typography-body-md-medium mt-1 text-error">
          {videoLimitMessage}
        </p>
      )}
    </>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className={REQUIRED_CLASS}>
      *
    </span>
  );
}

function UploadErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mt-4 flex items-center gap-3 rounded-12 bg-[#ffe2e2] px-4 py-3.5">
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

function PosterThumb({
  item,
  index,
  dragMode,
  canReorder,
  onRemove,
  onAdjust,
  onChangeThumbnail,
}: {
  item: PosterItem;
  index: number;
  dragMode: ReorderDragMode;
  canReorder: boolean;
  onRemove: () => void;
  onAdjust: () => void;
  onChangeThumbnail: () => void;
}) {
  const isRepresentative = index === 0;
  const isVideo = item.mediaType === 'VIDEO';
  const isUploading = !isPosterReady(item);
  const {
    setNodeRef,
    style: reorderStyle,
    className: reorderClassName,
    itemProps: reorderProps,
  } = useHorizontalReorderItem({
    id: item.id,
    dragMode,
    disabled: !canReorder,
  });

  return (
    <div
      ref={setNodeRef}
      style={reorderStyle}
      aria-busy={isUploading}
      {...reorderProps}
      aria-roledescription="순서를 바꿀 수 있는 포스터"
      aria-label={`포스터 ${index + 1}${isVideo ? ', 영상' : ''}${isRepresentative ? ', 대표' : ''}`}
      className={cn(
        'relative h-26.25 w-21 shrink-0 animate-rise snap-start overflow-hidden bg-[#f4f4f5] [animation-duration:350ms] [animation-fill-mode:backwards]',
        reorderClassName,
        FOCUS_CLASS,
      )}
    >
      {item.previewUrl && (
        <img
          src={item.previewUrl}
          alt=""
          draggable={false}
          className={cn('size-full object-cover', isUploading && 'opacity-50')}
        />
      )}
      {/* 영상은 H.264 변환 · 업로드에 시간이 걸려 끝날 때까지 칸 안에 로더를 둔다 */}
      {isUploading && (isVideo || !item.previewUrl) && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-secondary">
          <Loader label={null} />
        </span>
      )}
      {isVideo && (
        <span className="typography-body-sm-semibold pointer-events-none absolute top-1.5 left-1.5 inline-flex h-5 items-center gap-0.75 rounded-4 bg-[rgba(0,0,0,0.72)] pr-1.5 pl-1 text-base-white tabular-nums">
          <PlayIcon className="size-2.5" />
          {item.duration !== undefined && formatVideoDuration(item.duration)}
        </span>
      )}
      {isRepresentative && !isUploading && (
        <button
          type="button"
          aria-label={isVideo ? '영상 썸네일 변경' : '대표 포스터 썸네일 조정'}
          onClick={isVideo ? onChangeThumbnail : onAdjust}
          {...STOP_REORDER_PROPS}
          className={CHIP_BUTTON_CLASS}
        >
          {isVideo ? '썸네일' : '조정'}
        </button>
      )}
      {isRepresentative && (
        <span className="typography-body-sm-semibold pointer-events-none absolute bottom-1.5 left-1.5 inline-flex h-5.5 items-center rounded-4 bg-[#000] px-1.5 text-base-white">
          대표
        </span>
      )}
      <button
        type="button"
        aria-label={`포스터 ${index + 1} 삭제`}
        onClick={onRemove}
        {...STOP_REORDER_PROPS}
        className={cn(
          'absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-circle bg-primary-white text-primary shadow-[0_1px_4px_rgba(0,0,0,0.15)] after:absolute after:-inset-2.5',
          FOCUS_CLASS,
        )}
      >
        <CloseIcon strokeWidth={2.4} className="size-3" />
      </button>
    </div>
  );
}

interface PosterUploadFieldProps {
  posters: PosterUploads;
}

export function PosterUploadField({ posters }: PosterUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSession, setCropSession] = useState<{ item: PosterItem; key: number } | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [thumbnailSession, setThumbnailSession] = useState<{
    item: PosterItem;
    key: number;
  } | null>(null);
  const [isThumbnailOpen, setIsThumbnailOpen] = useState(false);
  const { items, errorKind, videoLimitMessage } = posters;
  const ids = items.map((item) => item.id);
  const { dragMode, contextProps } = useHorizontalReorder({ onMove: posters.move });
  const { isDragging: isFileOver, dropProps } = useFileDrop(posters.addFiles);
  const fieldProps = {
    ...dropProps,
    className: cn('mt-6', isFileOver && DROP_ACTIVE_CLASS),
  };

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

  const openThumbnail = (item: PosterItem) => {
    setThumbnailSession((prev) => ({ item, key: (prev?.key ?? 0) + 1 }));
    setIsThumbnailOpen(true);
  };

  const fileInput = (
    <input ref={inputRef} type="file" hidden multiple accept={ACCEPT} onChange={handleFiles} />
  );
  const errorBox = errorKind && <UploadErrorBox onRetry={handleRetry} />;

  if (items.length === 0) {
    return (
      <div {...fieldProps}>
        {fileInput}
        <div className="flex items-start gap-4">
          <button type="button" onClick={openPicker} className={cn(ADD_TILE_CLASS, 'h-30 w-24')}>
            <PlusIcon strokeWidth={1.6} className="size-7" />
            포스터 업로드
          </button>
          <div className="min-w-0 flex-1 pt-0.5">
            <span className="typography-body-lg-semibold block text-primary">
              전시 포스터
              <RequiredMark />
            </span>
            <PosterHelp videoLimitMessage={videoLimitMessage} />
          </div>
        </div>
        {errorBox}
      </div>
    );
  }

  return (
    <div {...fieldProps}>
      {fileInput}
      <div className="typography-body-lg-semibold flex justify-between text-primary">
        <span>
          전시 포스터
          <RequiredMark />
        </span>
        <span className={COUNT_CLASS}>
          {items.length} / {MAX_POSTER_UPLOAD_IMAGES}
        </span>
      </div>
      <PosterHelp videoLimitMessage={videoLimitMessage} />
      {errorBox}
      <DndContext {...contextProps}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {/* 프로토타입: 집힌 칸의 그림자 · 커지는 만큼 위아래 12px 여유를 둔다(아래는 -12px 로 자리 유지) */}
          <div
            className={cn(
              '-mx-gutter -mb-3 flex snap-x snap-proximity scroll-px-gutter gap-2 overflow-x-auto px-gutter py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              dragMode && 'snap-none',
            )}
          >
            {items.length < MAX_POSTER_UPLOAD_IMAGES && (
              <button
                type="button"
                onClick={openPicker}
                className={cn(ADD_TILE_CLASS, 'h-26.25 w-21 snap-start')}
              >
                <PlusIcon strokeWidth={1.6} className="size-6" />
                추가
              </button>
            )}
            {items.map((item, index) => (
              <PosterThumb
                key={item.id}
                item={item}
                index={index}
                dragMode={dragMode}
                canReorder={items.length > 1}
                onRemove={() => posters.remove(item.id)}
                onAdjust={() => openCrop(item)}
                onChangeThumbnail={() => openThumbnail(item)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {cropSession && (
        <PosterCropSheet
          key={cropSession.key}
          open={isCropOpen}
          imageUrl={cropSession.item.previewUrl}
          initialCrop={cropSession.item.crop ?? null}
          initialFit={cropSession.item.fit ?? null}
          edgeColor={
            posters.items.find(({ id }) => id === cropSession.item.id)?.edgeColor ??
            cropSession.item.edgeColor ??
            null
          }
          onClose={() => setIsCropOpen(false)}
          onDone={(crop, fit) => {
            posters.setCrop(cropSession.item.id, crop, fit);
            setIsCropOpen(false);
          }}
        />
      )}
      {thumbnailSession?.item.videoSrc && (
        <VideoThumbnailSheet
          key={thumbnailSession.key}
          open={isThumbnailOpen}
          videoSrc={thumbnailSession.item.videoSrc}
          imageAcceptTypes={POSTER_ACCEPT_TYPES}
          maxImageMb={MAX_POSTER_FILE_MB}
          onClose={() => setIsThumbnailOpen(false)}
          onSelect={(file) => {
            posters.setThumbnail(thumbnailSession.item.id, file);
            setIsThumbnailOpen(false);
          }}
        />
      )}
    </div>
  );
}
