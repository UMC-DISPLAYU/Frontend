import { useParams } from 'react-router-dom';

import { ArtworkBottomBar } from '@/components/artworkdetailpage/ArtworkActions';
import {
  getProcessImages,
  hasArtworkIntro,
} from '@/components/artworkdetailpage/artworkDetail.utils';
import {
  ArtworkDetailShell,
  ArtworkDetailSkeleton,
} from '@/components/artworkdetailpage/ArtworkDetailShell';
import { PersonalArtworkGuestbookTab } from '@/components/artworkdetailpage/PersonalArtworkGuestbookTab';
import { PersonalArtworkIntroTab } from '@/components/artworkdetailpage/PersonalArtworkIntroTab';
import { PersonalArtworkMeta } from '@/components/artworkdetailpage/PersonalArtworkMeta';
import { PersonalArtworkSaveButton } from '@/components/artworkdetailpage/PersonalArtworkSaveButton';
import { ErrorView } from '@/components/common';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { usePersonalArtwork } from '@/hooks/queries/usePersonalArtwork';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { getErrorMessage } from '@/utils/error';

export function PersonalArtworkDetailPage() {
  const flowBack = useFlowBack();
  const { personalArtworkId: idParam } = useParams<{ personalArtworkId: string }>();
  const personalArtworkId = Number(idParam ?? 0);

  const { data: artwork, isPending, error, refetch } = usePersonalArtwork(personalArtworkId);
  const { data: userMe } = useUserMe();

  if (isPending && Number.isFinite(personalArtworkId) && personalArtworkId > 0) {
    return <ArtworkDetailSkeleton />;
  }

  if (error || !artwork) {
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

  /* 뷰어는 작품 이미지만 씁니다(작업과정 이미지는 소개 탭에서 별도로 씁니다). */
  const imageUrls = artwork.images
    .filter((image) => image.imageType !== 'WORK_PROCESS')
    .map((image) => image.imageUrl)
    .filter((url): url is string => Boolean(url));
  const viewerImages = imageUrls.length > 0 ? imageUrls : [FALLBACK_POSTER_IMAGE];

  return (
    <ArtworkDetailShell
      key={personalArtworkId}
      images={viewerImages}
      title={artwork.artworkName}
      onBack={() => flowBack()}
      label={<PersonalArtworkMeta artwork={artwork} shareImageUrl={viewerImages[0]} />}
      hasIntro={hasArtworkIntro({
        content: artwork.content,
        point: artwork.point,
        processImageCount: getProcessImages(artwork.images).length,
      })}
      intro={<PersonalArtworkIntroTab artwork={artwork} />}
      guestbook={<PersonalArtworkGuestbookTab artwork={artwork} myUserId={userMe?.id} />}
      bottomBar={
        <ArtworkBottomBar
          shareTitle={artwork.artworkName}
          shareImageUrl={viewerImages[0]}
          saveButton={
            <PersonalArtworkSaveButton
              personalArtworkId={personalArtworkId}
              saved={artwork.isArchived ?? false}
            />
          }
        />
      }
    />
  );
}
