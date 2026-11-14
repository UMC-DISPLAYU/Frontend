import type { HTMLAttributes } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { WorkIcon } from '@/components/exhibition-work';
import { MAX_CONTENT_IMAGES } from '@/constants';
import type { Content } from '@/types';
import { cn } from '@/utils/cn';

interface ContentCardProps {
  content: Content;
  onClick: () => void;
  editing?: boolean;
  onDelete?: () => void;
  /* 편집 모드 손잡이에 붙일 끌기 속성(dnd-kit) */
  handleProps?: HTMLAttributes<HTMLSpanElement> & { ref?: (node: HTMLElement | null) => void };
  dragging?: boolean;
}

/*
 * 프로토타입 works.html `.srow`: 대표 사진 72×96 · 제목 16 SemiBold · 설명 12(두 줄) · 사진 수는 아래에 붙인다.
 * 편집 모드는 오른쪽에 삭제 · 손잡이(각 32, 아이콘 24, 간격 8)를 두고 손잡이로만 끈다
 */
export function ContentCard({
  content,
  onClick,
  editing = false,
  onDelete,
  handleProps,
  dragging = false,
}: ContentCardProps) {
  const body = (
    <>
      <span className="grid h-24 w-18 place-items-center overflow-hidden bg-[#f4f4f5] text-[#18181b]">
        {content.thumbnail ? (
          <OptimizedImage
            src={content.thumbnail}
            displayWidth={72}
            alt=""
            skeleton
            frameClassName="h-24 w-18"
            className="object-cover"
          />
        ) : (
          <WorkIcon name="image" className="size-5.5" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[16px] font-semibold break-words">{content.title}</span>
        {content.description && (
          <span className="mt-1 line-clamp-2 text-[12px] font-medium text-[#3f3f47]">
            {content.description}
          </span>
        )}
        <span className="mt-auto text-[12px] font-medium text-[#3f3f47] tabular-nums">
          사진 {content.photoCount}/{MAX_CONTENT_IMAGES}
        </span>
      </span>
    </>
  );

  // 편집 · 완료를 오가도 대표 사진이 다시 불러와지지 않게 틀은 같게 두고 오른쪽 칸과 누르는 영역만 바꾼다
  return (
    <div
      className={cn(
        'group relative grid w-full items-stretch gap-x-4 border-b border-[#f0f0f3] py-4',
        editing ? 'grid-cols-[72px_minmax(0,1fr)_72px]' : 'grid-cols-[72px_minmax(0,1fr)_20px]',
        dragging && 'bg-[#f4f4f5] opacity-60',
      )}
    >
      {body}
      {editing ? (
        <span className="flex items-center justify-end gap-2 self-center">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`${content.title} 삭제`}
              className="grid size-8 place-items-center rounded-circle text-[#18181b] transition-colors duration-fast hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
            >
              <WorkIcon name="trash" />
            </button>
          )}
          <span
            {...handleProps}
            role="button"
            tabIndex={0}
            aria-label={`${content.title} 순서 이동`}
            className="grid size-8 cursor-grab touch-none place-items-center text-[#18181b] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:cursor-grabbing"
          >
            <WorkIcon name="lines" />
          </span>
        </span>
      ) : (
        <>
          <WorkIcon
            name="chev"
            className="size-5 self-center transition-transform duration-base ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[3px]"
          />
          <button
            type="button"
            onClick={onClick}
            aria-label={`${content.title}, 사진 ${content.photoCount}장 편집`}
            className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]"
          />
        </>
      )}
    </div>
  );
}
