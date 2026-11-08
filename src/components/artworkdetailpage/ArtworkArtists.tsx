import { useState } from 'react';

import { Link } from 'react-router-dom';

import chevronIcon from '@/assets/artwork-detail/chevron-artist.svg';

export type ArtworkArtist = {
  /* 직접 입력된 작가는 계정이 없어 프로필로 이동할 수 없습니다. */
  userId?: number;
  name: string;
};

const COLLAPSE_FROM = 5;
const COLLAPSED_COUNT = 3;
const ARTIST_CLASS = 'typography-body-xl-semibold flex h-8 items-center gap-0.5 text-primary';

export function ArtworkArtists({ artists }: { artists: ArtworkArtist[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCollapsed = artists.length >= COLLAPSE_FROM && !isExpanded;
  const visibleArtists = isCollapsed ? artists.slice(0, COLLAPSED_COUNT) : artists;
  const hiddenCount = artists.length - COLLAPSED_COUNT;

  return (
    <div className="flex flex-wrap items-center gap-x-3.5">
      {visibleArtists.map((artist, index) =>
        artist.userId ? (
          <Link
            key={`${artist.userId}-${index}`}
            to={`/artist/${artist.userId}`}
            aria-label={`작가 ${artist.name} 프로필 보기`}
            className={ARTIST_CLASS}
          >
            {artist.name}
            <img src={chevronIcon} alt="" />
          </Link>
        ) : (
          <span key={`${artist.name}-${index}`} className={ARTIST_CLASS}>
            {artist.name}
          </span>
        ),
      )}
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label={`나머지 작가 ${hiddenCount}명 모두 보기`}
          className={`${ARTIST_CLASS} cursor-pointer`}
        >
          외 {hiddenCount}명
          <img src={chevronIcon} alt="" className="rotate-90" />
        </button>
      )}
    </div>
  );
}
