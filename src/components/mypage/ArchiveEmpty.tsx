import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui';
import { useSkeleton } from '@/hooks/useSkeleton';

import { ChevronRightIcon } from './MyPageIcons';

const RAIL_SIZE_CLASS = 'aspect-3/4 w-full';
const RAIL_FRAME_CLASS = `${RAIL_SIZE_CLASS} bg-tertiary`;

export type ArchiveRecommendation = {
  key: string;
  to: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

type ArchiveEmptyProps = {
  title: string;
  linkLabel: string;
  linkTo: string;
  /** 제목 아래 인기 전시 · 작품 줄. 비어 있으면 줄을 숨긴다 */
  recommendations: ArchiveRecommendation[];
  recommendationLabel: string;
  isRecommendationPending: boolean;
};

export function ArchiveEmpty({
  title,
  linkLabel,
  linkTo,
  recommendations,
  recommendationLabel,
  isRecommendationPending,
}: ArchiveEmptyProps) {
  const { showSkeleton, skeletonProps } = useSkeleton(isRecommendationPending);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 pt-6 pb-3">
        <h3 className="typography-body-xl-semibold text-primary">{title}</h3>
        <Link
          className="typography-body-lg-medium -mr-0.5 inline-flex h-11 shrink-0 items-center text-tertiary transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-focus active:scale-97"
          to={linkTo}
        >
          {linkLabel}
          <ChevronRightIcon />
        </Link>
      </div>
      {(showSkeleton || recommendations.length > 0) && (
        <section aria-label={recommendationLabel}>
          {/* 화면 끝까지 넘겨 볼 수 있게 좌우 여백만큼 밖으로 뺀다 */}
          <ul
            {...skeletonProps}
            className="-mx-gutter flex snap-x snap-proximity scroll-px-gutter gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {showSkeleton ? (
              <SkeletonList count={4}>
                {() => (
                  <li aria-hidden="true" className="w-32 shrink-0">
                    {/* 회색 칸은 스켈레톤 색(bg-secondary)을 쓰도록 틀의 bg-tertiary 를 빼고 크기만 맞춘다 */}
                    <Skeleton className={RAIL_SIZE_CLASS} />
                    <SkeletonText className="typography-body-lg-semibold mt-2 w-7/10" />
                    <SkeletonText className="typography-body-md-medium w-1/2" />
                  </li>
                )}
              </SkeletonList>
            ) : (
              recommendations.map((item) => (
                <li className="w-32 shrink-0 snap-start" key={item.key}>
                  <Link
                    className="block text-primary transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-97"
                    draggable={false}
                    to={item.to}
                  >
                    <OptimizedImage
                      alt=""
                      displayWidth={128}
                      draggable={false}
                      frameClassName={RAIL_FRAME_CLASS}
                      skeleton
                      src={item.imageUrl}
                    />
                    <span className="typography-body-lg-semibold mt-2 block truncate">
                      {item.title}
                    </span>
                    <span className="typography-body-md-medium block truncate text-tertiary">
                      {item.subtitle}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
