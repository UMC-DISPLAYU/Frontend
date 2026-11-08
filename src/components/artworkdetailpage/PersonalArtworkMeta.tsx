import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import { useTogglePersonalArtworkLike } from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkInlineActions } from './ArtworkActions';
import { getArtworkSpecText } from './artworkDetail.utils';
import { ArtworkLabel } from './ArtworkLabel';
import { PersonalArtworkSaveButton } from './PersonalArtworkSaveButton';

type Props = {
  artwork: PersonalArtworkResponseDataDto;
  shareImageUrl?: string;
};

export function PersonalArtworkMeta({ artwork, shareImageUrl }: Props) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();

  const liked = artwork.isLiked ?? false;
  const likeCount = artwork.likeCount ?? 0;
  const toggleLike = useTogglePersonalArtworkLike(artwork.personalArtworkId);

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
        artists={artwork.artistName ? [{ userId: artwork.userId, name: artwork.artistName }] : []}
        spec={getArtworkSpecText(artwork)}
        liked={liked}
        likeCount={likeCount}
        onToggleLike={handleLike}
        actions={
          <ArtworkInlineActions
            shareTitle={artwork.artworkName}
            shareImageUrl={shareImageUrl}
            saveButton={
              <PersonalArtworkSaveButton
                personalArtworkId={artwork.personalArtworkId}
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
