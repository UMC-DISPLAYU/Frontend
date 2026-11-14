import { type ChangeEvent, useRef, useState } from 'react';

import { DndContext } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';

import { MAX_POSTER_UPLOAD_IMAGES } from '@/constants/exhibition';
import {
  type ReorderDragMode,
  STOP_REORDER_PROPS,
  useHorizontalReorder,
  useHorizontalReorderItem,
} from '@/hooks/useHorizontalReorder';
import { cn } from '@/utils/cn';

import { MAX_POSTER_FILE_MB, POSTER_ACCEPT_TYPES } from './displayRegister.constants';
import { COUNT_CLASS, FOCUS_CLASS, REQUIRED_CLASS } from './displayRegister.styles';
import { CloseIcon, PlusIcon } from './DisplayRegisterIcons';
import { PosterCropSheet } from './PosterCropSheet';
import type { PosterItem, PosterUploads } from './usePosterUploads';

const ADD_TILE_CLASS = cn(
  'typography-body-md-medium grid shrink-0 cursor-pointer place-content-center justify-items-center gap-2 border border-primary text-secondary transition-colors duration-fast hover:bg-secondary',
  FOCUS_CLASS,
);

function PosterHelp() {
  return (
    <p className="typography-body-md-medium mt-1 text-secondary">
      JPG, PNG, WEBP, HEIC · 장당 최대 {MAX_POSTER_FILE_MB}MB
      <br />큰 그래픽은 JPG 고화질로 내보내 주세요
      <br />
      영상은 1개까지 · MP4, MOV, WEBM · 30초 이내 · 200MB 이하
    </p>
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
  locked,
  dragMode,
  canReorder,
  onRemove,
  onAdjust,
}: {
  item: PosterItem;
  index: number;
  locked: boolean;
  dragMode: ReorderDragMode;
  canReorder: boolean;
  onRemove: () => void;
  onAdjust: () => void;
}) {
  const isRepresentative = index === 0;
  const isUploading = !item.uploadedUrl;
  const {
    setNodeRef,
    style: reorderStyle,
    className: reorderClassName,
    itemProps: reorderProps,
  } = useHorizontalReorderItem({
    id: item.id,
    dragMode,
    disabled: locked || !canReorder,
  });

  return (
    <div
      ref={setNodeRef}
      style={reorderStyle}
      aria-busy={isUploading}
      {...reorderProps}
      aria-roledescription="순서를 바꿀 수 있는 포스터"
      aria-label={`포스터 ${index + 1}${isRepresentative ? ', 대표' : ''}`}
      className={cn(
        'relative h-[105px] w-21 shrink-0 animate-rise snap-start overflow-hidden bg-[#f4f4f5] [animation-duration:350ms] [animation-fill-mode:backwards]',
        reorderClassName,
        FOCUS_CLASS,
      )}
    >
      <img
        src={item.previewUrl}
        alt=""
        draggable={false}
        className={cn('size-full object-cover', isUploading && 'opacity-50')}
      />
      {isRepresentative && !isUploading && !locked && (
        <button
          type="button"
          aria-label="대표 포스터 썸네일 조정"
          onClick={onAdjust}
          {...STOP_REORDER_PROPS}
          className={cn(
            'typography-body-sm-semibold absolute right-1.5 bottom-1.5 h-5.5 rounded-6 bg-[rgba(255,255,255,0.92)] px-2 text-primary after:absolute after:-inset-x-1 after:-inset-y-2.75',
            FOCUS_CLASS,
          )}
        >
          조정
        </button>
      )}
      {isRepresentative && (
        <span className="typography-body-sm-semibold pointer-events-none absolute bottom-1.5 left-1.5 inline-flex h-5 items-center rounded-4 bg-[#000] px-1.5 text-base-white">
          대표
        </span>
      )}
      {!locked && (
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
      )}
    </div>
  );
}

interface PosterUploadFieldProps {
  posters: PosterUploads;
  /** 수정 API 가 포스터 목록을 받지 않아, 수정 화면에서는 보기만 한다 */
  locked?: boolean;
}

export function PosterUploadField({ posters, locked = false }: PosterUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSession, setCropSession] = useState<{ item: PosterItem; key: number } | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const { items, errorKind } = posters;
  const ids = items.map((item) => item.id);
  const { dragMode, contextProps } = useHorizontalReorder({ onMove: posters.move });

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
  const errorBox = errorKind && <UploadErrorBox onRetry={handleRetry} />;

  if (items.length === 0) {
    return (
      <div className="mt-6">
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
            <PosterHelp />
          </div>
        </div>
        {errorBox}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!locked && fileInput}
      <div className="typography-body-lg-semibold flex justify-between text-primary">
        <span>
          전시 포스터
          <RequiredMark />
        </span>
        <span className={COUNT_CLASS}>
          {items.length} / {MAX_POSTER_UPLOAD_IMAGES}
        </span>
      </div>
      {locked ? (
        <p className="typography-body-md-medium mt-1 text-secondary">
          포스터는 지금 수정할 수 없어요
        </p>
      ) : (
        <PosterHelp />
      )}
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
            {!locked && items.length < MAX_POSTER_UPLOAD_IMAGES && (
              <button
                type="button"
                onClick={openPicker}
                className={cn(ADD_TILE_CLASS, 'h-[105px] w-21 snap-start')}
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
                locked={locked}
                dragMode={dragMode}
                canReorder={items.length > 1}
                onRemove={() => posters.remove(item.id)}
                onAdjust={() => openCrop(item)}
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
          onClose={() => setIsCropOpen(false)}
          onDone={(crop) => {
            posters.setCrop(cropSession.item.id, crop);
            setIsCropOpen(false);
          }}
        />
      )}
    </div>
  );
}
