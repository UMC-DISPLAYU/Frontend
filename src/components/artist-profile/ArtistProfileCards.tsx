import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonText } from '@/components/ui';
import { cn } from '@/utils/cn';

import { ChevronRightIcon } from './ArtistProfileIcons';

// 포스터 정식 규격 402:568
const POSTER_FRAME_CLASS = 'aspect-402/568 w-18 bg-secondary';
const WORK_FRAME_CLASS = 'aspect-3/4 w-full bg-secondary';

export type ExhibitionState = 'ongoing' | 'upcoming' | 'ended';

const STATE_LABEL: Record<ExhibitionState, string> = {
  ongoing: '전시 중',
  upcoming: '전시 예정',
  ended: '종료',
};

// 전시 중 = 검은 점, 예정 = 테두리만, 종료 = 회색 점
const STATE_DOT_CLASS: Record<ExhibitionState, string> = {
  ongoing: 'bg-primary-black',
  upcoming: 'shadow-[inset_0_0_0_1.5px_var(--text-color-primary)]',
  ended: 'bg-[#d4d4d8]',
};

export type ArtistExhibitionView = {
  key: string;
  to: string;
  state: ExhibitionState;
  title: string;
  organization: string;
  period: string;
  place: string;
  posterImageUrl: string | null;
};

export function ArtistExhibitionRow({ exhibition }: { exhibition: ArtistExhibitionView }) {
  return (
    <Link
      className="group grid grid-cols-[72px_minmax(0,1fr)_20px] items-center gap-x-4 py-4 text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      to={exhibition.to}
    >
      {exhibition.posterImageUrl ? (
        <OptimizedImage
          alt=""
          displayWidth={144}
          frameClassName={POSTER_FRAME_CLASS}
          skeleton
          src={exhibition.posterImageUrl}
        />
      ) : (
        <span className={cn('block', POSTER_FRAME_CLASS)} />
      )}
      <span className="grid min-w-0 gap-0.5">
        {/* 프로토타입처럼 상태 줄 높이는 본문 글씨(14 → 900px 이상 16)의 줄 높이를 따른다 */}
        <span className="typography-body-lg-regular desktop:typography-body-xl-regular block">
          <span className="typography-body-md-medium inline-flex items-center gap-1.5 text-tertiary">
            <i
              aria-hidden="true"
              className={cn('size-[7px] rounded-circle', STATE_DOT_CLASS[exhibition.state])}
            />
            {STATE_LABEL[exhibition.state]}
          </span>
        </span>
        <strong className="typography-body-xl-semibold truncate group-active:underline group-active:underline-offset-3">
          {exhibition.title}
        </strong>
        {exhibition.organization && (
          <span className="typography-body-md-medium truncate text-secondary">
            {exhibition.organization}
          </span>
        )}
        <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-secondary">
          <span className="typography-body-md-regular2">{exhibition.period}</span>
          {exhibition.place && (
            <span className="typography-body-md-medium">{exhibition.place}</span>
          )}
        </span>
      </span>
      <ChevronRightIcon className="size-4.5 text-icon-tertiary transition-transform duration-base ease-standard group-hover:translate-x-0.75" />
    </Link>
  );
}

export function ArtistExhibitionRowSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 py-4">
      <Skeleton className={POSTER_FRAME_CLASS} />
      <div className="grid gap-0.5 self-center">
        <SkeletonText className="typography-body-md-medium h-4.5 w-12" />
        <SkeletonText className="typography-body-xl-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
        <SkeletonText className="typography-body-md-regular2 w-3/5" />
      </div>
    </div>
  );
}

export type ArtistWorkView = {
  key: string;
  to: string;
  title: string;
  /* 대표 작가 → 공동 작가 순서. 개인 작품은 작가 한 명이다 */
  artistNames: string[];
  imageUrl: string | null;
};

export function ArtistWorkCard({ work }: { work: ArtistWorkView }) {
  return (
    <Link
      className="group block text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
      to={work.to}
    >
      {work.imageUrl ? (
        <OptimizedImage
          alt={work.title}
          className="transition-transform duration-slow ease-standard group-hover:scale-103"
          displayWidth={340}
          frameClassName={WORK_FRAME_CLASS}
          skeleton
          src={work.imageUrl}
        />
      ) : (
        <span className={cn('block', WORK_FRAME_CLASS)} />
      )}
      <span className="mt-2.5 block">
        <span className="typography-body-lg-semibold desktop:typography-body-xl-semibold block truncate">
          {work.title}
        </span>
        {work.artistNames.length > 0 && (
          <span className="typography-body-md-medium block truncate text-tertiary">
            {work.artistNames.join(', ')}
          </span>
        )}
      </span>
    </Link>
  );
}

export function ArtistWorkCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className={WORK_FRAME_CLASS} />
      <div className="mt-1">
        <SkeletonText className="typography-body-lg-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
      </div>
    </div>
  );
}
