import { useArchiveArtwork, useUnarchiveArtwork } from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { toast } from '@/stores/toastStore';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkSaveButtonView } from './ArtworkSaveButtonView';

type Props = {
  className?: string;
  artworkId: number;
  /* 작품 상세의 isArchived. 저장 여부에 따라 버튼 문구가 바뀝니다. */
  saved?: boolean;
};

export function ArtworkSaveButton({ className, artworkId, saved = false }: Props) {
  const archive = useArchiveArtwork();
  const unarchive = useUnarchiveArtwork();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const isPending = archive.isPending || unarchive.isPending;
  const canToggleArchive = hasPermission(archivePolicy, saved ? 'delete' : 'create');

  const toggleSave = () => {
    if (isPending || artworkId <= 0) return;
    if (!canToggleArchive) {
      openLoginModal();
      return;
    }

    if (saved) unarchive.mutate(artworkId, { onSuccess: () => toast('저장을 취소했어요') });
    else archive.mutate(artworkId, { onSuccess: () => toast('보관함에 저장했어요') });
  };

  return (
    <>
      <ArtworkSaveButtonView saved={saved} onClick={toggleSave} className={className} />
      {loginModal}
    </>
  );
}
