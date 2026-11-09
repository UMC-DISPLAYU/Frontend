import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ArtworkBottomBar } from '@/components/artworkdetailpage/ArtworkActions';
import type { ArtworkArtist } from '@/components/artworkdetailpage/ArtworkArtists';
import {
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
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import type { ArtworkDetail } from '@/types/exhibition';
import { getExhibitionArtistName } from '@/utils/artist';
import { getErrorMessage } from '@/utils/error';
import { getExhibitionState } from '@/utils/exhibitionState';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';

export function ArtworkDetailPage() {
  const flowBack = useFlowBack();
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);

  const { data: userMe } = useUserMe();
  const { data: detail, isPending, error, refetch } = useArtworkDetail(artworkId);
  /* 작가 전용 권한 판단(팀원 여부 등)과 전시 상태 표시에 필요해 전시 상세도 함께 조회합니다. */
  const { data: display, isLoading: isDisplayLoading } = useDisplayDetail(
    detail?.exhibitionInfo?.displayId ?? 0,
  );

  // 공개 전 여부를 알기 전에 버튼이 눌리거나 방명록을 부르지 않도록 전시 상세까지 기다린다
  if ((isPending || isDisplayLoading) && Number.isFinite(artworkId) && artworkId > 0) {
    return <ArtworkDetailSkeleton />;
  }

  if (error || !detail) {
    return (
      <ErrorView
        message={
          error
            ? getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')
            : '작품 정보를 찾을 수 없습니다'
        }
        onRetry={
          error
            ? () => {
                void refetch();
              }
            : () => flowBack()
        }
        retryLabel={error ? '다시 시도' : '뒤로가기'}
      />
    );
  }

  const policyDisplay = (display ?? { ownerUserId: 0, teamMembers: [] }) as DisplayDetailDto;
  const isPreview = display ? isPreviewDisplay(display) : false;

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

  const artists: ArtworkArtist[] = [
    { userId: detail.artistUserId, name: artistDisplayName || '작가 미상' },
    ...(detail.coAuthors ?? [])
      .filter((coAuthor) => coAuthor.userId !== detail.artistUserId)
      .map((coAuthor) => ({ userId: coAuthor.userId ?? undefined, name: coAuthor.name })),
  ];

  /* 뷰어는 작품 이미지만 씁니다. 썸네일로 지정된 이미지를 앞에 두고, 없으면 등록 순서대로 보여줍니다. */
  const artworkImages = (detail.images ?? []).filter((image) => image.imageType !== 'WORK_PROCESS');
  const imageUrls = artworkImages
    .map((image) => image.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const thumbnailUrl = artworkImages.find((image) => image.isThumbnail)?.imageUrl;
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
      onBack={() => flowBack()}
      isPreview={isPreview}
      label={
        <ArtworkMeta
          artwork={artwork}
          artists={artists}
          exhibitionState={getExhibitionState(display?.period)}
          shareImageUrl={orderedImages[0]}
          isPreview={isPreview}
        />
      }
      hasIntro={hasArtworkIntro({
        content: detail.content,
        point: detail.point,
        processImageCount: processImageUrls.length,
      })}
      intro={
        <ArtworkIntroTab
          content={detail.content}
          point={detail.point}
          processImageUrls={processImageUrls}
        />
      }
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
          shareImageUrl={orderedImages[0]}
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
