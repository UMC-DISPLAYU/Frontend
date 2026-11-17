import { Navigate, useLocation, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ArtworkBottomBar } from '@/components/artworkdetailpage/ArtworkActions';
import type { ArtworkArtist } from '@/components/artworkdetailpage/ArtworkArtists';
import {
  getArtworkArtists,
  getExhibitionOrganizerText,
  getProcessImages,
  hasArtworkIntro,
} from '@/components/artworkdetailpage/artworkDetail.utils';
import {
  ArtworkDetailShell,
  ArtworkDetailSkeleton,
} from '@/components/artworkdetailpage/ArtworkDetailShell';
import {
  ArtworkGuestbookTab,
  ArtworkPreviewGuestbook,
} from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ErrorView } from '@/components/common';
import { NotFoundView } from '@/components/error-page';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useSkeleton } from '@/hooks/useSkeleton';
import type { ArtworkDetail } from '@/types/exhibition';
import { getExhibitionArtistName } from '@/utils/artist';
import { isVideoMedia, toDisplayImageCardUrl } from '@/utils/displayMedia';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { getExhibitionState } from '@/utils/exhibitionState';

type ArtworkDetailPageProps = {
  /* 전시 작업에서 연 작품 미리보기(/exhibition/:displayId/artworks/:artworkId/preview)의 전시 */
  previewDisplayId?: number;
};

export function ArtworkDetailPage({ previewDisplayId }: ArtworkDetailPageProps = {}) {
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);
  const { search } = useLocation();

  const { data: userMe } = useUserMe();
  const { data: detail, isPending, error, refetch } = useArtworkDetail(artworkId);
  /* 작가 전용 권한 판단(팀원 여부 등)과 전시 상태 표시에 필요해 전시 상세도 함께 조회합니다. */
  const { data: display, isLoading: isDisplayLoading } = useDisplayDetail(
    detail?.exhibitionInfo?.displayId ?? 0,
  );

  // 공개 전 여부를 알기 전에 버튼이 눌리거나 방명록을 부르지 않도록 전시 상세까지 기다린다
  const { showSkeleton } = useSkeleton(
    (isPending || isDisplayLoading) && Number.isFinite(artworkId) && artworkId > 0,
  );

  if (showSkeleton) return <ArtworkDetailSkeleton />;

  // 미리보기 주소의 전시와 작품이 속한 전시가 다르면 권한을 확인한 전시의 작품이 아니므로 보여주지 않는다
  const isOtherDisplay =
    previewDisplayId !== undefined && detail?.exhibitionInfo?.displayId !== previewDisplayId;

  if (isNotFoundError(error) || (!error && (!detail || isOtherDisplay))) return <NotFoundView />;

  if (error || !detail) {
    return (
      <ErrorView
        message={getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  /*
   * 미리보기 화면은 미리보기 주소 하나로만 둔다(전시 상세와 같은 방식).
   * 등록 중(DRAFT) 전시의 작품을 공개 주소로 열면 미리보기 주소로 보내고, 그 라우트 가드가 팀원만 열어 준다.
   * 심사를 통과해 공개된 전시는 개막 전이어도 일반 상세로 보인다
   */
  if (previewDisplayId === undefined && display?.status === 'DRAFT') {
    return (
      <Navigate
        to={`/exhibition/${display.displayId}/artworks/${artworkId}/preview${search}`}
        replace
      />
    );
  }

  const policyDisplay = (display ?? { ownerUserId: 0, teamMembers: [] }) as DisplayDetailDto;
  const isPreview = previewDisplayId !== undefined;

  const artistDisplayName = getExhibitionArtistName(
    detail.artistName,
    detail.artistUserId,
    display?.teamMembers,
  );

  const artwork: ArtworkDetail = {
    artworkId: detail.artworkId,
    artworkName: detail.artworkName,
    content: detail.content,
    type: detail.type,
    productionYear: detail.productionYear,
    materialMedia: detail.materialMedia ?? '',
    size: detail.size,
    point: detail.point,
    images: detail.images,
    artist: artistDisplayName,
    exhibitionId: String(detail.exhibitionInfo?.displayId ?? ''),
    exhibitionTitle: detail.exhibitionInfo?.exhibitionTitle ?? '',
    exhibitionSubtitle: detail.exhibitionInfo?.exhibitionSubtitle ?? '',
    exhibitionOrganizer: getExhibitionOrganizerText(
      display,
      detail.exhibitionInfo?.exhibitionOrganizer ?? '',
    ),
    exhibitionPeriod: detail.exhibitionInfo?.exhibitionPeriod ?? '',
    exhibitionThumbnail: detail.exhibitionInfo?.exhibitionThumbnailUrl ?? '',
    bookmarkCount: detail.likeCount ?? 0,
    isLiked: detail.isLiked ?? false,
    isArchived: detail.isArchived ?? false,
  };

  const artists: ArtworkArtist[] = getArtworkArtists({
    artistUserId: detail.artistUserId,
    artistName: artistDisplayName,
    coAuthors: detail.coAuthors,
  });

  /*
   * 뷰어는 작품 이미지만 씁니다. 썸네일로 지정된 이미지를 앞에 두고, 없으면 등록 순서대로 보여줍니다.
   * 영상은 칸에 썸네일을 보이고, 누르면 플레이어 창에서 재생합니다
   */
  const artworkImages = (detail.images ?? []).filter(
    (image) => image.imageType !== 'WORK_PROCESS' && toDisplayImageCardUrl(image),
  );
  const thumbnailImage = artworkImages.find((image) => image.isThumbnail);
  const orderedImages = thumbnailImage
    ? [thumbnailImage, ...artworkImages.filter((image) => image !== thumbnailImage)]
    : artworkImages;
  const viewerImages =
    orderedImages.length > 0 ? orderedImages.map(toDisplayImageCardUrl) : [FALLBACK_POSTER_IMAGE];
  const viewerVideoSrcs = orderedImages.map((image) =>
    isVideoMedia(image) ? image.imageUrl : undefined,
  );

  const processImageUrls = getProcessImages(detail.images ?? []).map((image) => image.imageUrl);

  return (
    <ArtworkDetailShell
      key={artworkId}
      images={viewerImages}
      videoSrcs={viewerVideoSrcs}
      title={detail.artworkName}
      subtitle={artists.map((artist) => artist.name).join(', ')}
      isPreview={isPreview}
      label={
        <ArtworkMeta
          artwork={artwork}
          artists={artists}
          exhibitionState={getExhibitionState(display?.period)}
          isPreview={isPreview}
          previewMode={previewDisplayId !== undefined}
        />
      }
      hasIntro={hasArtworkIntro({
        content: detail.content,
        processImageCount: processImageUrls.length,
      })}
      intro={<ArtworkIntroTab content={detail.content} processImageUrls={processImageUrls} />}
      guestbook={
        isPreview ? (
          <ArtworkPreviewGuestbook />
        ) : (
          <ArtworkGuestbookTab
            artworkId={artworkId}
            display={policyDisplay}
            myUserId={userMe?.id}
          />
        )
      }
      bottomBar={
        <ArtworkBottomBar
          shareTitle={detail.artworkName}
          disabled={isPreview}
          saveButton={
            <ArtworkSaveButton
              artworkId={artworkId}
              saved={detail.isArchived ?? false}
              disabled={isPreview}
            />
          }
        />
      }
    />
  );
}
