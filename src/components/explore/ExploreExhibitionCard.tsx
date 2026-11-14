import { Link } from 'react-router-dom';

import type { DisplayListItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

import { CARD_CLASS, CARD_IMAGE_CLASS, CARD_TITLE_CLASS } from './exploreCardStyles';

const POSTER_FRAME_CLASS = 'aspect-402/568 w-full bg-[#f4f4f5]';

type ExploreExhibitionCardProps = {
  exhibition: DisplayListItemDto;
};

export function ExploreExhibitionCard({ exhibition }: ExploreExhibitionCardProps) {
  return (
    <Link className={CARD_CLASS} to={`/display/${exhibition.displayId}`}>
      <OptimizedImage
        alt={`${exhibition.title} 포스터`}
        className={CARD_IMAGE_CLASS}
        displayWidth={280}
        frameClassName={POSTER_FRAME_CLASS}
        skeleton
        src={exhibition.posterImageUrl}
      />
      <span className="block pt-2">
        <span className={CARD_TITLE_CLASS}>{exhibition.title}</span>
        <span className="block truncate text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#3f3f47]">
          {exhibition.schoolDepartmentName}
        </span>
        {/* 숫자가 붙어 보이지 않게 날짜만 자간을 +1% 로 둔다(프로토타입 dt12) */}
        <span className="mt-1 block truncate text-[12px] leading-[1.4] font-medium tracking-[0.01em] text-[#71717b]">
          {formatExhibitionPeriod(exhibition.startedAt, exhibition.endedAt)}
        </span>
        {exhibition.placeName ? (
          <span className="mt-0.5 block truncate text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#71717b]">
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
