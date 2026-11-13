import { Heart } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { type ArtworkArtist, ArtworkArtists } from './ArtworkArtists';

type Props = {
  title: string;
  artists: ArtworkArtist[];
  spec: string;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  /* 공개 전 미리보기에서는 누를 수 없다 */
  disabled?: boolean;
  /* 소속 전시 줄. 개인 작품에는 없습니다. */
  exhibition?: ReactNode;
  /* 900px 이상에서 이름표 아래에 놓이는 저장·공유 */
  actions: ReactNode;
};

export function ArtworkLabel({
  title,
  artists,
  spec,
  liked,
  likeCount,
  onToggleLike,
  disabled = false,
  exhibition,
  actions,
}: Props) {
  return (
    <div className="px-gutter pt-6 pb-3 desktop:px-0 desktop:pt-0">
      <div className="flex items-start gap-4">
        <h1 className="typography-title-xs desktop:typography-title-md min-w-0 flex-1 break-keep text-primary">
          {title}
        </h1>
        <button
          type="button"
          aria-label="좋아요"
          aria-pressed={liked}
          onClick={onToggleLike}
          disabled={disabled}
          title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
          className="-m-2 -mt-1.5 flex w-11 shrink-0 cursor-pointer flex-col items-center p-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
        >
          <Heart
            aria-hidden="true"
            size={24}
            strokeWidth={1.5}
            className={cn(
              'text-icon-primary transition-transform duration-base ease-standard',
              liked && 'scale-112 fill-current',
            )}
          />
          <span className="typography-body-md-medium text-secondary">{likeCount}</span>
        </button>
      </div>

      <div className="mt-1 flex flex-col">
        <ArtworkArtists artists={artists} />
        {spec && <p className="typography-body-lg-medium text-secondary">{spec}</p>}
      </div>

      {exhibition}

      <div className="mt-5 mb-1 hidden gap-2 desktop:flex">{actions}</div>
    </div>
  );
}
