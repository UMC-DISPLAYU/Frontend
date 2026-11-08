import { useArchivePersonalArtwork, useUnarchivePersonalArtwork } from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { toast } from '@/stores/toastStore';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkSaveButtonView } from './ArtworkSaveButtonView';

type Props = {
  className?: string;
  personalArtworkId: number;
  /* 개인 작품 상세의 isArchived. 저장 여부에 따라 버튼 문구가 바뀝니다. */
  saved?: boolean;
};

export function PersonalArtworkSaveButton({ className, personalArtworkId, saved = false }: Props) {
  const archive = useArchivePersonalArtwork();
  const unarchive = useUnarchivePersonalArtwork();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const isPending = archive.isPending || unarchive.isPending;
  const canToggleArchive = hasPermission(archivePolicy, saved ? 'delete' : 'create');

  const toggleSave = () => {
    if (isPending || personalArtworkId <= 0) return;
    if (!canToggleArchive) {
      openLoginModal();
      return;
    }

    if (saved) unarchive.mutate(personalArtworkId, { onSuccess: () => toast('저장을 취소했어요') });
    else archive.mutate(personalArtworkId, { onSuccess: () => toast('보관함에 저장했어요') });
  };

  return (
    <>
      <ArtworkSaveButtonView saved={saved} onClick={toggleSave} className={className} />
      {loginModal}
    </>
  );
}
