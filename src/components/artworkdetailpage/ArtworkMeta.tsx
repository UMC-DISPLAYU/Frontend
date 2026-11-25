import { useToggleArtworkLike } from '@/hooks/queries/useArtworkDetail';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import type { ArtworkDetail } from '@/types/exhibition';
import type { ExhibitionState } from '@/utils/exhibitionState';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkInlineActions } from './ArtworkActions';
import type { ArtworkArtist } from './ArtworkArtists';
import { type ArtworkPartInfo, getArtworkSpecText } from './artworkDetail.utils';
import { ArtworkExhibitionRow } from './ArtworkExhibitionRow';
import { ArtworkLabel } from './ArtworkLabel';
import { ArtworkSaveButton } from './ArtworkSaveButton';

type Props = {
  artwork: ArtworkDetail;
  artists: ArtworkArtist[];
  exhibitionState: ExhibitionState | null;
  isPreview: boolean;
  /* 작품 미리보기: 소속 전시 줄을 두지 않고, 작가 이름을 눌러도 프로필로 가지 않는다(사용자 결정) */
  previewMode?: boolean;
  /* 연작에서 보고 있는 작품. 작품명 · 정보 줄만 이 작품으로 바꾼다(공유 제목은 작품 1) */
  part?: ArtworkPartInfo;
};

export function ArtworkMeta({
  artwork,
  artists,
  exhibitionState,
  isPreview,
  previewMode = false,
  part,
}: Props) {
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
        title={part?.artworkName ?? artwork.artworkName}
        artists={artists}
        spec={getArtworkSpecText(part ?? artwork)}
        liked={liked}
        likeCount={likeCount}
        onToggleLike={handleLike}
        disabled={isPreview}
        linkArtists={!previewMode}
        exhibition={
          previewMode ? undefined : (
            <ArtworkExhibitionRow
              displayId={artwork.exhibitionId}
              title={artwork.exhibitionTitle}
              organizer={artwork.exhibitionOrganizer}
              posterUrl={artwork.exhibitionThumbnail}
              state={exhibitionState}
            />
          )
        }
        actions={
          <ArtworkInlineActions
            shareTitle={artwork.artworkName}
            disabled={isPreview}
            saveButton={
              <ArtworkSaveButton
                artworkId={artwork.artworkId}
                saved={artwork.isArchived ?? false}
                disabled={isPreview}
              />
            }
          />
        }
      />
      {loginModal}
    </>
  );
}
