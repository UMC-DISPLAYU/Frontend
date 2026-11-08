import { useToggleArtworkLike } from '@/hooks/queries/useArtworkDetail';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import type { ArtworkDetail } from '@/types/exhibition';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkInlineActions } from './ArtworkActions';
import type { ArtworkArtist } from './ArtworkArtists';
import { type ExhibitionState, getArtworkSpecText } from './artworkDetail.utils';
import { ArtworkExhibitionRow } from './ArtworkExhibitionRow';
import { ArtworkLabel } from './ArtworkLabel';
import { ArtworkSaveButton } from './ArtworkSaveButton';

type Props = {
  artwork: ArtworkDetail;
  artists: ArtworkArtist[];
  exhibitionState: ExhibitionState | null;
  shareImageUrl?: string;
};

export function ArtworkMeta({ artwork, artists, exhibitionState, shareImageUrl }: Props) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();

  /* 좋아요 상태와 개수는 작품 상세 응답을 그대로 씁니다. */
  const liked = artwork.isLiked ?? false;
  const likeCount = artwork.likeCount ?? artwork.bookmarkCount ?? 0;
  const toggleLike = useToggleArtworkLike(artwork.artworkId);

  const handleLike = () => {
    if (toggleLike.isPending) return;
    if (!hasPermission(archivePolicy, liked ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(liked);
  };

  return (
    <>
      <ArtworkLabel
        title={artwork.artworkName}
        artists={artists}
        spec={getArtworkSpecText(artwork)}
        liked={liked}
        likeCount={likeCount}
        onToggleLike={handleLike}
        exhibition={
          <ArtworkExhibitionRow
            displayId={artwork.exhibitionId}
            title={artwork.exhibitionTitle}
            organizer={artwork.exhibitionOrganizer}
            posterUrl={artwork.exhibitionThumbnail}
            state={exhibitionState}
          />
        }
        actions={
          <ArtworkInlineActions
            shareTitle={artwork.artworkName}
            shareImageUrl={shareImageUrl}
            saveButton={
              <ArtworkSaveButton
                artworkId={artwork.artworkId}
                saved={artwork.isArchived ?? false}
              />
            }
          />
        }
      />
      {loginModal}
    </>
  );
}
