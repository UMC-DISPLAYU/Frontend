import { Link } from 'react-router-dom';

import type { DisplayTeamMemberDto } from '@/api/dto';
import { ErrorView } from '@/components/common/ErrorView';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { getExhibitionArtistName } from '@/utils/artist';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

type Props = {
  displayId: number;
  teamMembers?: DisplayTeamMemberDto[];
  isPreview: boolean;
};

const GRID = 'grid grid-cols-2 gap-3 desktop:grid-cols-3 desktop:gap-4';

/* 피그마 `Card / 작품 · 검정`: 사진(3:4) 안쪽 8, 사진 아래 12 · 제목↔작가 2 · 아래 12 */
const CARD_FRAME = 'aspect-3/4 w-full overflow-hidden rounded-12';

export function WorksPanel({ displayId, teamMembers, isPreview }: Props) {
  const { data, error, isPending, isError, refetch } = useDisplayArtworks(displayId);
  const artworks = data?.artworks ?? [];

  return (
    <section aria-label="작품 미리보기" className="px-gutter pt-6 pb-10 desktop:px-0">
      {isPending ? (
        <div className={GRID}>
          <SkeletonList count={4}>
            {() => (
              <div className="rounded-12 bg-base-black p-2">
                <Skeleton className={CARD_FRAME} />
                <div className="h-15" />
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
          {artworks.map((artwork, index) => (
            <Link
              key={artwork.artworkId}
              to={`/artwork/${artwork.artworkId}`}
              style={staggerStyle(index)}
              className="group block animate-rise overflow-hidden rounded-12 bg-base-black text-quaternary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
            >
              <div className="px-2 pt-2">
                <OptimizedImage
                  src={artwork.artworkImageUrl}
                  displayWidth={360}
                  alt={artwork.artworkName}
                  skeleton
                  frameClassName={CARD_FRAME}
                  className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-103"
                />
              </div>
              <div className="p-3">
                <b className="typography-body-lg-semibold block truncate">{artwork.artworkName}</b>
                <span className="typography-body-md-medium mt-0.5 block truncate">
                  {getExhibitionArtistName(artwork.artistName, artwork.artistUserId, teamMembers)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
