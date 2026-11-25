import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ArtworkBottomBar } from '@/components/artworkdetailpage/ArtworkActions';
import type { ArtworkArtist } from '@/components/artworkdetailpage/ArtworkArtists';
import {
  type ArtworkPartInfo,
  getArtworkArtists,
  getArtworkPhotoCaptions,
  getArtworkViewerImages,
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
import { useSwipeBack } from '@/hooks/useSwipeBack';
import type { ArtworkDetail } from '@/types/exhibition';
import { getExhibitionArtistName } from '@/utils/artist';
import { isVideoMedia, toDisplayImageCardUrl } from '@/utils/displayMedia';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { getExhibitionState } from '@/utils/exhibitionState';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';

type ArtworkDetailPageProps = {
  /* 전시 작업에서 연 작품 미리보기(/exhibition/:displayId/artworks/:artworkId/preview)의 전시 */
  previewDisplayId?: number;
};

export function ArtworkDetailPage({ previewDisplayId }: ArtworkDetailPageProps = {}) {
  useSwipeBack();
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);

  const { data: userMe } = useUserMe();
  const { data: detail, isPending, error, refetch } = useArtworkDetail(artworkId);
  /* 작가 전용 권한 판단(팀원 여부 등)과 전시 상태 표시에 필요해 전시 상세도 함께 조회합니다. */
  const {
    data: display,
    isLoading: isDisplayLoading,
    error: displayError,
  } = useDisplayDetail(detail?.exhibitionInfo?.displayId ?? 0);

  // 공개 전 여부를 알기 전에 버튼이 눌리거나 방명록을 부르지 않도록 전시 상세까지 기다린다
  const { showSkeleton } = useSkeleton(
    (isPending || isDisplayLoading) && Number.isFinite(artworkId) && artworkId > 0,
  );

  if (showSkeleton) return <ArtworkDetailSkeleton />;

  // 미리보기 주소의 전시와 작품이 속한 전시가 다르면 권한을 확인한 전시의 작품이 아니므로 보여주지 않는다
  const isOtherDisplay =
    previewDisplayId !== undefined && detail?.exhibitionInfo?.displayId !== previewDisplayId;
  // 공개 전 전시(준비 중 · 심사 중 · 반려)나 작품 공개 시점 전의 작품을 공개 주소로 열면 팀원이어도 404 다
  // (미리보기 주소로만 본다). 작품이 속한 전시를 볼 수 없으면(서버 404 · 403) 작품도 404 다
  const isHiddenOnPublic =
    previewDisplayId === undefined &&
    ((display !== undefined &&
      (isPreviewDisplay(display) || display.artworkContentVisible === false)) ||
      isNotFoundError(displayError));

  if (isNotFoundError(error) || (!error && (!detail || isOtherDisplay)) || isHiddenOnPublic) {
    return <NotFoundView />;
  }

  if (error || !detail) {
    return (
      <ErrorView
        message={getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')}
        onRetry={() => void refetch()}
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
   * 연작은 작품 1 → 작품 2 … 순서로 잇고, 보고 있는 사진이 속한 작품의 작품명 · 정보 줄을 보여줍니다.
   * 영상은 칸에 썸네일을 보이고, 누르면 플레이어 창에서 재생합니다
   */
  const parts = detail.parts ?? [];
  const works: ArtworkPartInfo[] = [
    {
      artworkName: detail.artworkName,
      productionYear: detail.productionYear,
      materialMedia: detail.materialMedia,
      size: detail.size,
    },
    ...parts,
  ];
  const viewerItems = getArtworkViewerImages(
    (detail.images ?? []).filter((image) => toDisplayImageCardUrl(image)),
    parts.length,
  );
  const orderedImages = viewerItems.map((item) => item.image);
  const photoParts = viewerItems.map((item) => item.partIndex);
  const isSeries = parts.length > 0 && orderedImages.length > 0;
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
      {...(isSeries && {
        photoParts,
        photoTitles: photoParts.map((partIndex) => works[partIndex].artworkName),
        photoCaptions: getArtworkPhotoCaptions(photoParts, works),
      })}
      label={(partIndex) => (
        <ArtworkMeta
          artwork={artwork}
          artists={artists}
          exhibitionState={getExhibitionState(display?.period)}
          isPreview={isPreview}
          previewMode={previewDisplayId !== undefined}
          part={isSeries ? works[partIndex] : undefined}
        />
      )}
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
