import type { PointerEvent as ReactPointerEvent } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { WorkIcon } from '@/components/exhibition-work';
import { cn } from '@/utils/cn';
import { staggerStyle } from '@/utils/stagger';

import { SECTION_FOCUS_RING as focusRing } from './sectionPhotos.constants';

/* 프로토타입 `.ptool b`: "사진* n/20" — 사진은 1장 이상 필수(11-15) */
export function SectionPhotoCount({ count, max }: { count: number; max: number }) {
  return (
    <h2 className="text-[14px] font-semibold tabular-nums">
      사진
      <span aria-hidden="true" className="ml-[3px] text-[#fb2c36]">
        *
      </span>
      <span className="sr-only">(필수)</span> {count}/{max}
    </h2>
  );
}

/* 프로토타입 `.pgrid .addp` */
export function SectionAddPhotoButton({
  busy,
  disabled,
  onClick,
}: {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <li className="aspect-3/4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`grid size-full content-center justify-items-center gap-1.5 border border-[#d4d4d8] text-[12px] font-medium transition-colors duration-fast hover:bg-[#f4f4f5] disabled:cursor-default disabled:text-[#d4d4d8] ${focusRing}`}
      >
        <WorkIcon name="plus" className="size-6.5" strokeWidth={1.6} />
        {busy ? '업로드 중' : '사진 추가'}
      </button>
    </li>
  );
}

/* 프로토타입 `.upnote`: 올리지 못한 사진 안내 */
export function SectionPhotoNote({
  rejectedCount,
  message,
}: {
  rejectedCount: number;
  message?: string | null;
}) {
  if (rejectedCount <= 0 && !message) return null;
  return (
    <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-12 bg-[#f4f4f5] px-3.5 py-3">
      <WorkIcon name="info" className="mt-px size-4.5 text-[#71717b]" />
      <div className="min-w-0 text-[12px] leading-[1.4] font-medium whitespace-pre-line text-[#3f3f47]">
        {rejectedCount > 0 && (
          <p>
            <b className="block font-semibold text-[#18181b]">
              {rejectedCount}장은 올리지 못했어요
            </b>
            지원하지 않는 형식이거나 20MB를 넘는 파일이에요
          </p>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

/*
 * 프로토타입 `.pgrid .ph`: 편집 모드에서는 칸 어디를 눌러도 끈다(삭제 버튼 제외).
 * 끄는 칸은 제자리에서 흐려지고(.ph.drag 투명도 .55) 다른 칸 위로 가면 바로 자리를 바꾼다
 */
export function SectionPhotoTile({
  id,
  src,
  alt,
  index,
  editing,
  canDrag,
  canDelete,
  dragging,
  disabled,
  onPointerDown,
  onMoveByKey,
  onRemove,
}: {
  id: string | number;
  src: string;
  alt?: string;
  index: number;
  editing: boolean;
  canDrag: boolean;
  canDelete: boolean;
  dragging: boolean;
  disabled: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onMoveByKey: (key: string) => boolean;
  onRemove: () => void;
}) {
  return (
    <li
      data-sort-id={id}
      tabIndex={canDrag ? 0 : undefined}
      aria-label={canDrag ? `사진 ${index + 1}, 방향키로 순서 이동` : undefined}
      onPointerDown={onPointerDown}
      onKeyDown={(event) => {
        if (canDrag && onMoveByKey(event.key)) event.preventDefault();
      }}
      className={cn(
        `relative aspect-3/4 min-w-0 overflow-hidden bg-[#f4f4f5] ${focusRing}`,
        editing && 'touch-none select-none',
        canDrag && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-55',
      )}
    >
      <div className="h-full animate-rise" style={staggerStyle(index)}>
        <OptimizedImage
          src={src}
          alt={alt ?? `사진 ${index + 1}`}
          displayWidth={208}
          skeleton
          draggable={false}
          frameClassName="h-full w-full"
          className="object-cover"
        />
      </div>
      {editing && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-1.5 grid size-6 place-items-center rounded-circle bg-[rgba(0,0,0,.55)] text-[10px] font-semibold text-[#fff] tabular-nums"
          >
            {index + 1}
          </span>
          {canDelete && (
            <button
              type="button"
              data-sort-ignore
              disabled={disabled}
              onClick={onRemove}
              aria-label={`사진 ${index + 1} 삭제`}
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-circle bg-[rgba(0,0,0,.55)] text-[#fff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff] disabled:opacity-40"
            >
              <WorkIcon name="close" className="size-3.5" strokeWidth={2.2} />
            </button>
          )}
        </>
      )}
    </li>
  );
}
