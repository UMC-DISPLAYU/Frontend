import { Bookmark, Heart } from 'lucide-react';

import {
  useLikeLoungePost,
  useScrapLoungePost,
  useUnlikeLoungePost,
  useUnscrapLoungePost,
} from '@/hooks/queries/useLounge';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useLoungePostPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  postId: number;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  hasComments?: boolean;
};

export function LoungeBoardActionBar({
  postId,
  likeCount,
  isLiked,
  isSaved,
  hasComments = true,
}: Props) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const loungePostPolicy = useLoungePostPolicy();
  const likeMutation = useLikeLoungePost();
  const unlikeMutation = useUnlikeLoungePost();
  const scrapMutation = useScrapLoungePost();
  const unscrapMutation = useUnscrapLoungePost();

  const isLikeMutating = likeMutation.isPending || unlikeMutation.isPending;
  const isScrapMutating = scrapMutation.isPending || unscrapMutation.isPending;
  const canLikePost = hasPermission(loungePostPolicy, isLiked ? 'unlike' : 'like');
  const canScrapPost = hasPermission(loungePostPolicy, 'scrap');

  const handleLikeClick = () => {
    if (isLikeMutating) return;
    if (!canLikePost) {
      openLoginModal();
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate(postId);
    } else {
      likeMutation.mutate(postId);
    }
  };

  const handleSaveClick = () => {
    if (isScrapMutating) return;
    if (!canScrapPost) {
      openLoginModal();
      return;
    }

    if (isSaved) {
      unscrapMutation.mutate(postId);
    } else {
      scrapMutation.mutate(postId);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col">
        <div className="-mx-5 border-t border-line-soft" />

        <div className="-mx-5 flex items-center pt-4.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikeMutating}
              className="px-5 py-2 rounded-[10px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <Heart
                className={`size-5 ${isLiked ? 'fill-heart text-heart' : 'text-faint'}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-sm-regular text-hint">{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isScrapMutating}
              className="px-5 py-2 rounded-[10px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <Bookmark
                className={`size-4 ${isSaved ? 'text-bookmark fill-bookmark' : 'text-faint'}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-sm-regular text-hint">저장</span>
            </button>
          </div>
        </div>
      </div>

      {hasComments && <div className="-mx-5 h-1 bg-line-soft" />}

      {loginModal}
    </div>
  );
}
