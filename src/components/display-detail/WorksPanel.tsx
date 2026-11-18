import { Link } from 'react-router-dom';

import type { DisplayContentOpenType, DisplayPeriodDto, DisplayTeamMemberDto } from '@/api/dto';
import { ErrorView } from '@/components/common/ErrorView';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui/Skeleton';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getArtworkArtistNames } from '@/utils/artist';
import { croppedDisplayWidth, savedCropImageStyle } from '@/utils/cropBox';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

import { getContentOpenNotice } from './displayDetail.utils';

type Props = {
  displayId: number;
  teamMembers?: DisplayTeamMemberDto[];
  isPreview: boolean;
  /* 작품 공개 시점과 전시 기간. 개막 전 빈 목록이면 언제부터 보이는지 알린다 */
  artworkContentOpen?: DisplayContentOpenType;
  period?: DisplayPeriodDto;
  /* 작품 카드가 갈 주소. 없으면 공개 작품 상세 */
  artworkPath?: (artworkId: number) => string;
};

const GRID = 'grid grid-cols-2 gap-x-3 gap-y-6 desktop:grid-cols-3';

/* 피그마 `Card / 작품 · 검정`(카드 E): 틀 없이 사진(3:4), 사진 아래 8 · 제목↔작가 2 */
const CARD_FRAME = 'aspect-3/4 w-full overflow-hidden bg-secondary';

export function WorksPanel({
  displayId,
  teamMembers,
  isPreview,
  artworkContentOpen,
  period,
  artworkPath,
}: Props) {
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
            : (getContentOpenNotice(artworkContentOpen, period) ?? '아직 등록한 작품이 없어요')}
        </p>
      ) : (
        <div className={GRID}>
          {artworks.map((artwork, index) => (
            <Link
              key={artwork.artworkId}
              to={artworkPath?.(artwork.artworkId) ?? `/artwork/${artwork.artworkId}`}
              style={staggerStyle(index)}
              className="group block animate-rise text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
            >
              <OptimizedImage
                src={artwork.artworkImageUrl}
                displayWidth={croppedDisplayWidth(360, artwork.artworkCrop)}
                alt={artwork.artworkName}
                skeleton
                frameClassName={CARD_FRAME}
                className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-103"
                style={savedCropImageStyle(artwork.artworkCrop)}
              />
              <div className="pt-2">
                <b className="typography-body-lg-semibold block truncate">{artwork.artworkName}</b>
                <span className="typography-body-md-medium mt-0.5 block truncate text-secondary">
                  {getArtworkArtistNames(artwork, teamMembers).join(', ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
