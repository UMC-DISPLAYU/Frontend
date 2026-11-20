import { Link } from 'react-router-dom';

import type { DisplayListItemDto } from '@/api/dto';
import { FitImage } from '@/components/common/FitImage';
import { Skeleton, SkeletonText } from '@/components/ui';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';
import { POSTER_FIT_RULE } from '@/utils/imageFit';

import {
  CARD_CLASS,
  CARD_HOVER_CLASS,
  CARD_HOVER_TITLE_CLASS,
  CARD_IMAGE_CLASS,
  CARD_PHOTO_WRAP_CLASS,
  CARD_SKELETON_TEXT_CLASS,
  CARD_TEXT_CLASS,
  CARD_TITLE_CLASS,
  EXHIBITION_HOVER_GRADIENT,
} from './exploreCardStyles';
import { usePhotoPending } from './usePhotoPending';

const POSTER_FRAME_CLASS = 'aspect-402/568 w-full bg-[#f4f4f5]';

type ExploreExhibitionCardProps = {
  exhibition: DisplayListItemDto;
};

export function ExploreExhibitionCard({ exhibition }: ExploreExhibitionCardProps) {
  const { photoPending, onPhotoSettle } = usePhotoPending(exhibition.posterImageUrl);

  return (
    <Link
      className={CARD_CLASS}
      data-photo-pending={photoPending || undefined}
      to={`/display/${exhibition.displayId}`}
    >
      <span className={CARD_PHOTO_WRAP_CLASS}>
        <FitImage
          alt={`${exhibition.title} 포스터`}
          className={CARD_IMAGE_CLASS}
          crop={exhibition.posterCrop}
          displayWidth={280}
          // 영상 대표는 썸네일만 보이므로 지금처럼 꽉 채운다(보이는 방식은 대표 사진에만 적용)
          fit={exhibition.posterVideoUrl ? 'FILL' : exhibition.posterFit}
          fitClassName="bg-secondary"
          fitColor={exhibition.posterEdgeColor}
          rule={POSTER_FIT_RULE}
          frameClassName={POSTER_FRAME_CLASS}
          onError={onPhotoSettle}
          onLoad={onPhotoSettle}
          skeleton
          src={exhibition.posterImageUrl}
        />
        <span
          aria-hidden="true"
          className={CARD_HOVER_CLASS}
          style={{ backgroundImage: EXHIBITION_HOVER_GRADIENT }}
        >
          <span className={CARD_HOVER_TITLE_CLASS}>{exhibition.title}</span>
          <span className="mt-1 line-clamp-2 text-[10px] leading-[1.4] font-medium text-[#d4d4d8]">
            {exhibition.schoolDepartmentName}
          </span>
        </span>
      </span>
      <span className={CARD_TEXT_CLASS} data-card-text>
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
      <div className={CARD_SKELETON_TEXT_CLASS}>
        <SkeletonText className="typography-body-lg-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
        <SkeletonText className="typography-body-md-medium mt-1 w-3/5" />
        <SkeletonText className="typography-body-md-medium mt-0.5 w-2/5" />
      </div>
    </>
  );
}
