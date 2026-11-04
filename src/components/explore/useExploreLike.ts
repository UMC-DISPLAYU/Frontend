import { useToggleDisplayLike } from '@/hooks/queries/useDisplayDetail';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

export function useExploreLike() {
  const toggleLike = useToggleDisplayLike();
  const archivePolicy = useArchivePolicy();
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  const toggle = (displayId: number, liked: boolean) => {
    if (toggleLike.isPending) return;
    if (!hasPermission(archivePolicy, liked ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }
    toggleLike.mutate({ displayId, liked });
  };

  const isPendingFor = (displayId: number) =>
    toggleLike.isPending && toggleLike.variables?.displayId === displayId;

  return { toggle, isPendingFor, loginModal };
}
