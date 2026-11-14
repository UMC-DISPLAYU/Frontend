import { Link } from 'react-router-dom';

import type { DisplayListItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

const POSTER_FRAME_CLASS = 'aspect-402/568 w-full bg-secondary';

type ExploreExhibitionCardProps = {
  exhibition: DisplayListItemDto;
};

export function ExploreExhibitionCard({ exhibition }: ExploreExhibitionCardProps) {
  return (
    <Link
      className="group block text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
      to={`/display/${exhibition.displayId}`}
    >
      <OptimizedImage
        alt={`${exhibition.title} 포스터`}
        className="transition-transform duration-slow ease-standard group-hover:scale-103"
        displayWidth={280}
        frameClassName={POSTER_FRAME_CLASS}
        skeleton
        src={exhibition.posterImageUrl}
      />
      <span className="block pt-2">
        <span className="typography-body-lg-semibold block truncate">{exhibition.title}</span>
        <span className="typography-body-md-medium block truncate text-secondary">
          {exhibition.schoolDepartmentName}
        </span>
        <span className="typography-body-md-regular2 mt-1 block truncate text-tertiary">
          {formatExhibitionPeriod(exhibition.startedAt, exhibition.endedAt)}
        </span>
        {exhibition.placeName ? (
          <span className="typography-body-md-medium mt-0.5 block truncate text-tertiary">
            {exhibition.placeName}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function ExploreExhibitionCardSkeleton() {
  return (
    <>
      <Skeleton className={POSTER_FRAME_CLASS} />
      <Skeleton className="mt-2 h-5 w-3/4 rounded-4" />
      <Skeleton className="mt-0.5 h-4 w-1/2 rounded-4" />
      <Skeleton className="mt-1 h-4 w-2/3 rounded-4" />
      <Skeleton className="mt-0.5 h-4 w-1/3 rounded-4" />
    </>
  );
}
