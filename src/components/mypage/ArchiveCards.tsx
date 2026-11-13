import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';

import { BookmarkIcon } from './MyPageIcons';

// 포스터 정식 규격 402:568(탐색 · 홈과 같은 카드)
const POSTER_FRAME_CLASS = 'aspect-402/568 w-full bg-secondary';
const ARTWORK_FRAME_CLASS = 'aspect-175/234 w-full bg-secondary';

const CARD_CLASS =
  'group block text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98';
const IMAGE_HOVER_CLASS = 'transition-transform duration-slow ease-standard group-hover:scale-103';

export type ArchiveExhibitionView = {
  key: string;
  to: string;
  title: string;
  organization: string;
  period: string;
  place: string;
  posterImageUrl: string | null;
};

export function ArchiveExhibitionCard({ exhibition }: { exhibition: ArchiveExhibitionView }) {
  return (
    <Link className={CARD_CLASS} to={exhibition.to}>
      <OptimizedImage
        alt={`${exhibition.title} 포스터`}
        className={IMAGE_HOVER_CLASS}
        displayWidth={280}
        frameClassName={POSTER_FRAME_CLASS}
        skeleton
        src={exhibition.posterImageUrl}
      />
      {!exhibition.posterImageUrl && <span className={cn('block', POSTER_FRAME_CLASS)} />}
      <span className="block pt-2">
        <span className="typography-body-lg-semibold block truncate">{exhibition.title}</span>
        {exhibition.organization && (
          <span className="typography-body-md-medium block truncate text-secondary">
            {exhibition.organization}
          </span>
        )}
        <span className="typography-body-md-regular2 mt-1 block truncate text-tertiary">
          {exhibition.period}
        </span>
        {exhibition.place && (
          <span className="typography-body-md-medium mt-0.5 block truncate text-tertiary">
            {exhibition.place}
          </span>
        )}
      </span>
    </Link>
  );
}

export function ArchiveExhibitionCardSkeleton() {
  return (
    <>
      <Skeleton className={POSTER_FRAME_CLASS} />
      <Skeleton className="mt-2 h-5 w-3/4 rounded-4" />
      <Skeleton className="mt-0.5 h-4 w-1/2 rounded-4" />
      <Skeleton className="mt-1 h-4 w-2/3 rounded-4" />
    </>
  );
}

export type ArchiveArtworkView = {
  key: string;
  to: string;
  title: string;
  artistName: string;
  imageUrl: string | null;
};

export function ArchiveArtworkCard({ artwork }: { artwork: ArchiveArtworkView }) {
  return (
    <Link className={CARD_CLASS} to={artwork.to}>
      <OptimizedImage
        alt={artwork.title}
        className={IMAGE_HOVER_CLASS}
        displayWidth={280}
        frameClassName={ARTWORK_FRAME_CLASS}
        skeleton
        src={artwork.imageUrl}
      />
      {!artwork.imageUrl && <span className={cn('block', ARTWORK_FRAME_CLASS)} />}
      <span className="block pt-2">
        <span className="typography-body-lg-semibold block truncate">{artwork.title}</span>
        {artwork.artistName && (
          <span className="typography-body-md-medium block truncate text-secondary">
            {artwork.artistName}
          </span>
        )}
      </span>
    </Link>
  );
}

export function ArchiveArtworkCardSkeleton() {
  return (
    <>
      <Skeleton className={ARTWORK_FRAME_CLASS} />
      <Skeleton className="mt-2 h-5 w-3/4 rounded-4" />
      <Skeleton className="mt-0.5 h-4 w-1/2 rounded-4" />
    </>
  );
}

export type ArchiveArtistView = {
  key: string;
  to: string;
  name: string;
  /** "학교 · 분야". 없으면 이름만 보인다 */
  description: string;
};

type ArchiveArtistRowProps = {
  artist: ArchiveArtistView;
  isRemoving: boolean;
  onUnarchive: () => void;
};

export function ArchiveArtistRow({ artist, isRemoving, onUnarchive }: ArchiveArtistRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-bg-tertiary">
      <Link
        className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-12 py-4 text-primary transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-focus active:scale-98"
        to={artist.to}
      >
        <span className="typography-body-xl-semibold truncate">{artist.name}</span>
        {artist.description && (
          <span className="typography-body-md-medium truncate text-tertiary">
            {artist.description}
          </span>
        )}
      </Link>
      <button
        aria-label={`${artist.name} 작가 저장 해제`}
        aria-pressed="true"
        className="-mr-3 grid size-11 shrink-0 place-items-center rounded-circle text-icon-primary transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-focus active:scale-90 disabled:opacity-40"
        disabled={isRemoving}
        onClick={onUnarchive}
        type="button"
      >
        <BookmarkIcon className="size-5.5" fill="currentColor" />
      </button>
    </div>
  );
}

export function ArchiveArtistRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 border-b border-bg-tertiary py-4">
      <Skeleton className="h-5.5 w-24 rounded-4" />
      <Skeleton className="h-4 w-40 rounded-4" />
    </div>
  );
}
