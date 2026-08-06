import { Bookmark } from 'lucide-react';

import { useArchiveExhibition, useUnarchiveExhibition } from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

interface DisplaySaveButtonProps {
  className?: string;
  id?: string;
  displayId: number;
  /* 전시 상세의 isBookmarked. 저장 여부에 따라 버튼 문구가 바뀝니다. */
  saved?: boolean;
}

export function DisplaySaveButton({
  className = '',
  id,
  displayId,
  saved = false,
}: DisplaySaveButtonProps) {
  const archive = useArchiveExhibition();
  const unarchive = useUnarchiveExhibition();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const isPending = archive.isPending || unarchive.isPending;
  const canToggleArchive = hasPermission(archivePolicy, saved ? 'delete' : 'create');

  const toggleSave = () => {
    if (isPending || displayId <= 0) return;
    if (!canToggleArchive) {
      openLoginModal();
      return;
    }

    if (saved) unarchive.mutate(displayId);
    else archive.mutate(displayId);
  };

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={toggleSave}
        disabled={isPending}
        aria-pressed={saved}
        className={cn(
          'w-full py-3.5 rounded-xl bg-main text-white typo-body-sm-bold tracking-tight transition-all duration-200 active:scale-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60',
          className,
        )}
      >
        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
        {saved ? '저장됨' : '전시 저장'}
      </button>
      {loginModal}
    </>
  );
}
