import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import type { DisplayTeamMemberDto } from '@/api/dto';
import { ErrorView } from '@/components/common/ErrorView';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui/Skeleton';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getExhibitionArtistName } from '@/utils/artist';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';
import { formatVideoDuration, readVideoDuration } from '@/utils/videoFile';

import { PlayMarkIcon } from './PosterVideoSlide';

type Props = {
  displayId: number;
  teamMembers?: DisplayTeamMemberDto[];
  isPreview: boolean;
  /* 작품 카드가 갈 주소. 없으면 공개 작품 상세 */
  artworkPath?: (artworkId: number) => string;
};

const GRID = 'grid grid-cols-2 gap-x-3 gap-y-6 desktop:grid-cols-3';

/* 피그마 `Card / 작품 · 검정`(카드 E): 틀 없이 사진(3:4), 사진 아래 8 · 제목↔작가 2 */
const CARD_FRAME = 'aspect-3/4 w-full overflow-hidden bg-secondary';
const CARD_CLASS =
  'group block animate-rise text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98';

/** 영상 작품 카드 위 재생 표시와 길이. 길이는 영상을 읽을 수 있을 때만 보인다(프로토타입) */
function VideoMarks({ src }: { src: string }) {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;
    void readVideoDuration(src).then((value) => {
      if (!isCancelled) setDuration(value);
    });
    return () => {
      isCancelled = true;
    };
  }, [src]);

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 grid size-11 -translate-1/2 place-items-center rounded-circle bg-[rgba(0,0,0,0.55)] text-base-white backdrop-blur-[10px] transition-[scale,background-color] duration-base ease-standard group-hover:scale-108 group-hover:bg-[rgba(0,0,0,0.7)]"
      >
        <PlayMarkIcon className="ml-0.5 size-5" />
      </span>
      {duration !== null && (
        <span className="typography-body-md-medium absolute bottom-2 left-2 rounded-6 bg-[rgba(0,0,0,0.55)] px-1.75 py-0.5 text-base-white tabular-nums">
          {formatVideoDuration(duration)}
        </span>
      )}
    </>
  );
}

export function WorksPanel({ displayId, teamMembers, isPreview, artworkPath }: Props) {
  const { data, error, isPending, isError, refetch } = useDisplayArtworks(displayId);
  const artworks = data?.artworks ?? [];
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);

  return (
    <section
      aria-label="작품 미리보기"
      className="px-gutter pt-6 pb-10 desktop:px-0"
      {...skeletonProps}
    >
      {showSkeleton ? (
        <div className={GRID}>
          <SkeletonList count={4}>
            {() => (
              <div>
                <Skeleton className={CARD_FRAME} />
                <div className="pt-2">
                  <SkeletonText className="typography-body-lg-semibold w-2/3" />
                  <SkeletonText className="typography-body-md-medium mt-0.5 w-1/3" />
                </div>
              </div>
            )}
          </SkeletonList>
        </div>
      ) : isError && !data ? (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, '작품을 불러오지 못했어요.')}
          onRetry={() => void refetch()}
          retryLabel="다시 시도"
        />
      ) : artworks.length === 0 ? (
        <p className="typography-body-lg-regular pt-8 pb-6 text-center whitespace-pre-line text-tertiary">
          {isPreview
            ? '아직 등록한 작품이 없어요\n전시에 작품을 올리면 여기에 보여요'
            : '아직 등록한 작품이 없어요'}
        </p>
      ) : (
        <div className={GRID}>
          {artworks.map((artwork, index) => {
            const videoUrl = artwork.artworkVideoUrl;

            // 영상 작품도 같은 카드로 작품 상세로 간다(작품 상세에서 그 칸에서 재생한다)
            return (
              <Link
                key={artwork.artworkId}
                to={artworkPath?.(artwork.artworkId) ?? `/artwork/${artwork.artworkId}`}
                style={staggerStyle(index)}
                className={CARD_CLASS}
              >
                <div className="relative">
                  <OptimizedImage
                    src={artwork.artworkImageUrl}
                    displayWidth={360}
                    alt={videoUrl ? `${artwork.artworkName} 영상` : artwork.artworkName}
                    skeleton
                    frameClassName={CARD_FRAME}
                    className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-103"
                  />
                  {videoUrl && <VideoMarks src={videoUrl} />}
                </div>
                <div className="pt-2">
                  <b className="typography-body-lg-semibold block truncate">
                    {artwork.artworkName}
                  </b>
                  <span className="typography-body-md-medium mt-0.5 block truncate text-secondary">
                    {getExhibitionArtistName(artwork.artistName, artwork.artistUserId, teamMembers)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
