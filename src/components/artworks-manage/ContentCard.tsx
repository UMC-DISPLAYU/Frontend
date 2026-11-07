import { Pencil } from 'lucide-react';

import SectionChevronIcon from '@/assets/exhibition-work/SectionChevronIcon.svg';
import SectionPhotoIcon from '@/assets/exhibition-work/SectionPhotoIcon.svg';
import SectionTrashIcon from '@/assets/exhibition-work/SectionTrashIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { Content } from '@/types';

interface ContentCardProps {
  content: Content;
  onClick: () => void;
  editing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ContentCard({
  content,
  onClick,
  editing = false,
  onEdit,
  onDelete,
}: ContentCardProps) {
  return (
    <div className="flex items-center border-b border-primary">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${content.title}, 사진 ${content.photoCount}개 보기`}
        className="group flex min-w-0 flex-1 items-center gap-4 rounded-12 py-4 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      >
        {content.thumbnail ? (
          <OptimizedImage
            src={content.thumbnail}
            displayWidth={96}
            alt=""
            skeleton
            frameClassName="size-24 shrink-0 rounded-12"
            className="transition-transform duration-base ease-standard group-hover:scale-103"
          />
        ) : (
          <span className="grid size-24 shrink-0 place-items-center rounded-12 bg-secondary">
            <img src={SectionPhotoIcon} alt="" />
          </span>
        )}
        <span className="flex h-24 min-w-0 flex-1 flex-col justify-between text-primary">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="typography-body-xl-semibold truncate">{content.title}</span>
            {content.description && (
              <span className="typography-body-md-medium line-clamp-2">{content.description}</span>
            )}
          </span>
          <span className="typography-body-md-medium text-secondary">
            사진 {content.photoCount}/20
          </span>
        </span>
        {!editing && (
          <span className="grid size-5 shrink-0 place-items-center">
            <img
              src={SectionChevronIcon}
              alt=""
              className="transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
            />
          </span>
        )}
      </button>
      {editing && (
        <div className="ml-1 flex shrink-0 items-center">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`${content.title} 섹션 삭제`}
              className="grid size-11 place-items-center rounded-12 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={SectionTrashIcon} alt="" />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`${content.title} 섹션 정보 수정`}
              className="grid size-11 place-items-center rounded-12 text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <Pencil aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
