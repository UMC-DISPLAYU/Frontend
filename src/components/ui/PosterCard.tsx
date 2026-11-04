import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { CardMetaList } from './CardMetaList';
import { LikeBadge } from './LikeBadge';

type PosterCardProps = {
  variant: 'exhibition' | 'artwork';
  to: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  likeCount?: number;
  liked?: boolean;
  onLikeClick?: () => void;
  isLikePending?: boolean;
};

export function PosterCard({
  variant,
  to,
  imageUrl,
  title,
  subtitle,
  period,
  location,
  likeCount,
  liked,
  onLikeClick,
  isLikePending,
}: PosterCardProps) {
  const isExhibition = variant === 'exhibition';

  return (
    // 하트 버튼을 링크 안에 넣으면 interactive 요소가 중첩되므로 형제로 겹쳐 둔다
    <div className="relative">
      <Link
        className="flex flex-col overflow-hidden rounded-12 bg-primary-black no-underline"
        to={to}
      >
        <div className="p-1.75">
          <OptimizedImage
            alt={title}
            className={cn(
              'w-full rounded-12 bg-secondary object-cover',
              isExhibition ? 'aspect-2/3' : 'aspect-3/4',
            )}
            displayWidth={200}
            src={imageUrl}
          />
        </div>

        <div className={cn('flex flex-col px-3 pb-2.5', isExhibition && 'gap-1')}>
          <div className="flex flex-col text-quaternary">
            <p className="typography-body-lg-bold truncate">{title}</p>
            {subtitle ? <p className="typography-body-md-medium truncate">{subtitle}</p> : null}
          </div>
          {isExhibition ? <CardMetaList location={location} period={period} /> : null}
        </div>
      </Link>

      {likeCount !== undefined ? (
        <LikeBadge
          className="absolute top-4 right-4"
          count={likeCount}
          disabled={isLikePending}
          liked={liked}
          onClick={onLikeClick}
        />
      ) : null}
    </div>
  );
}
