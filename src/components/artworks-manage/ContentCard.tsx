import { MoreHorizontal } from 'lucide-react';

import { FALLBACK_POSTER_IMAGE } from '@/constants';
import type { Content } from '@/types';
import { cn } from '@/utils/cn';

/* 대표 이미지가 없는 콘텐츠는 DU 로고를 폴백으로 보여줍니다. */
function Thumbnail({ src }: { src?: string }) {
  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-box200">
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center bg-box200 p-3">
          <img src={FALLBACK_POSTER_IMAGE} alt="" className="w-full opacity-40" />
        </div>
      )}
    </div>
  );
}

interface ContentCardProps {
  content: Content;
  onMore: (e: React.MouseEvent) => void;
  onClick?: () => void;
  dimmed?: boolean;
  showMore?: boolean;
  moreRef?: React.Ref<HTMLButtonElement>;
}

/* 콘텐츠 카드 (디자이너 지정 형식) */
export function ContentCard({
  content,
  onMore,
  onClick,
  dimmed = false,
  showMore = true,
  moreRef,
}: ContentCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    onClick();
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex h-27.5 items-center gap-3 overflow-hidden rounded-[18px] bg-card px-4 py-3.5',
        onClick && 'cursor-pointer',
        dimmed && 'opacity-40',
      )}
    >
      <Thumbnail src={content.thumbnail} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <p className="typo-body-md-bold truncate text-main">{content.title}</p>
        <div className="flex flex-col gap-4">
          <p className="typo-body-xs-regular line-clamp-2 text-sub700">{content.description}</p>
          <p className="typo-body-xxs-regular text-faint">
            {content.photoCount > 0
              ? `사진 ${content.photoCount} / 20`
              : '아직 추가된 사진이 없어요.'}
          </p>
        </div>
      </div>
      {showMore && (
        <button
          ref={moreRef}
          type="button"
          onClick={onMore}
          aria-label={`${content.title} 더보기`}
          aria-haspopup="menu"
          className="self-start p-1"
        >
          <MoreHorizontal className="size-5 text-hint" />
        </button>
      )}
    </div>
  );
}
