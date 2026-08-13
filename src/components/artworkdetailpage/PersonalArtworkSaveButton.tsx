import { SaveButtonUI } from '@/components/ui/SaveButtonUI';
import { useArchivePersonalArtwork, useUnarchivePersonalArtwork } from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  className?: string;
  id?: string;
  personalArtworkId: number;
  /* 개인 작품 상세의 isArchived. 저장 여부에 따라 버튼 문구가 바뀝니다. */
  saved?: boolean;
};

export function PersonalArtworkSaveButton({
  className = '',
  id,
  personalArtworkId,
  saved = false,
}: Props) {
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

    if (saved) unarchive.mutate(personalArtworkId);
    else archive.mutate(personalArtworkId);
  };

  return (
    <>
      <SaveButtonUI
        text={saved ? '저장됨' : '작품 저장'}
        variant="dark"
        isSaved={saved}
        onClick={toggleSave}
        className={className}
        id={id}
      />
      {loginModal}
    </>
  );
}
