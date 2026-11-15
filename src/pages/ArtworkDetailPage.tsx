import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ArtworkBottomBar } from '@/components/artworkdetailpage/ArtworkActions';
import type { ArtworkArtist } from '@/components/artworkdetailpage/ArtworkArtists';
import {
  getArtworkArtists,
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
import { useFlowBack } from '@/hooks/useFlowBack';
import { useSkeleton } from '@/hooks/useSkeleton';
import type { ArtworkDetail } from '@/types/exhibition';
import { getExhibitionArtistName } from '@/utils/artist';
import { toDisplayImageCardUrl } from '@/utils/displayMedia';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { getExhibitionState } from '@/utils/exhibitionState';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';

type ArtworkDetailPageProps = {
  /* 전시 작업에서 연 작품 미리보기(/exhibition/:displayId/artworks/:artworkId/preview)의 전시 */
  previewDisplayId?: number;
  onBack?: () => void;
};

export function ArtworkDetailPage({ previewDisplayId, onBack }: ArtworkDetailPageProps = {}) {
  const flowBack = useFlowBack();
  const goBack = onBack ?? (() => flowBack());
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);

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

  const policyDisplay = (display ?? { ownerUserId: 0, teamMembers: [] }) as DisplayDetailDto;
  const isPreview = previewDisplayId !== undefined || (display ? isPreviewDisplay(display) : false);

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
    materialMedia: detail.materialMedia,
    size: detail.size,
    point: detail.point,
    images: detail.images,
    artist: artistDisplayName,
    exhibitionId: String(detail.exhibitionInfo?.displayId ?? ''),
    exhibitionTitle: detail.exhibitionInfo?.exhibitionTitle ?? '',
    exhibitionSubtitle: detail.exhibitionInfo?.exhibitionSubtitle ?? '',
    exhibitionOrganizer: detail.exhibitionInfo?.exhibitionOrganizer ?? '',
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
   * 프로토타입 작품 상세에는 영상 재생이 없어 영상은 썸네일로 보입니다(영상 원본 주소는 이미지로 그릴 수 없다)
   */
  const artworkImages = (detail.images ?? []).filter((image) => image.imageType !== 'WORK_PROCESS');
  const imageUrls = artworkImages
    .map(toDisplayImageCardUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const thumbnailImage = artworkImages.find((image) => image.isThumbnail);
  const thumbnailUrl = thumbnailImage ? toDisplayImageCardUrl(thumbnailImage) : undefined;
  const orderedImages = thumbnailUrl
    ? [thumbnailUrl, ...imageUrls.filter((imageUrl) => imageUrl !== thumbnailUrl)]
    : imageUrls;
  const viewerImages = orderedImages.length > 0 ? orderedImages : [FALLBACK_POSTER_IMAGE];

  const processImageUrls = getProcessImages(detail.images ?? []).map((image) => image.imageUrl);

  return (
    <ArtworkDetailShell
      key={artworkId}
      images={viewerImages}
      title={detail.artworkName}
      subtitle={artists.map((artist) => artist.name).join(', ')}
      onBack={goBack}
      isPreview={isPreview}
      hideBack={previewDisplayId !== undefined}
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
