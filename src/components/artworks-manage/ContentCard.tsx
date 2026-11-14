import OrderIcon from '@/assets/exhibition-work/OrderIcon.svg';
import SectionChevronIcon from '@/assets/exhibition-work/SectionChevronIcon.svg';
import SectionPhotoIcon from '@/assets/exhibition-work/SectionPhotoIcon.svg';
import SectionTrashIcon from '@/assets/exhibition-work/SectionTrashIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { Content } from '@/types';

interface ContentCardProps {
  content: Content;
  onClick: () => void;
  editing?: boolean;
  onDelete?: () => void;
}

export function ContentCard({ content, onClick, editing = false, onDelete }: ContentCardProps) {
  return (
    <div className="relative flex items-center border-b border-primary">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${content.title}, 사진 ${content.photoCount}개 보기`}
        className="group flex min-w-0 flex-1 items-center gap-4 rounded-12 py-4 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      >
        {content.thumbnail ? (
          <OptimizedImage
            src={content.thumbnail}
            displayWidth={72}
            alt=""
            skeleton
            frameClassName="h-24 w-18 shrink-0"
            className="transition-transform duration-base ease-standard group-hover:scale-103"
          />
        ) : (
          <span className="grid h-24 w-18 shrink-0 place-items-center bg-secondary">
            <img src={SectionPhotoIcon} alt="" />
          </span>
        )}
        <span className="flex h-24 min-w-0 flex-1 flex-col justify-between text-primary">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="typography-body-xl-semibold truncate">{content.title}</span>
            {content.description && (
              <span className={`typography-body-md-medium line-clamp-2 ${editing ? 'pr-20' : ''}`}>
                {content.description}
              </span>
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
        <div className="absolute top-1/2 -right-3 flex -translate-y-1/2 items-center">
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
          {/* shortcut: 섹션 순서 저장 API가 연결되면 드래그 핸들을 활성화한다. */}
          <button
            type="button"
            disabled
            aria-label={`${content.title} 섹션 순서 변경 (준비 중)`}
            title="섹션 순서 변경은 아직 지원하지 않아요"
            className="grid size-11 cursor-default place-items-center rounded-12"
          >
            <img src={OrderIcon} alt="" />
          </button>
        </div>
      )}
    </div>
  );
}
