import { Bookmark, Flag, Heart } from 'lucide-react';

import {
  useLikeLoungePost,
  useScrapLoungePost,
  useUnlikeLoungePost,
  useUnscrapLoungePost,
} from '@/hooks/queries/useLounge';

type Props = {
  postId: number;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
};

export function LoungeBoardActionBar({ postId, likeCount, isLiked, isSaved }: Props) {
  const likeMutation = useLikeLoungePost();
  const unlikeMutation = useUnlikeLoungePost();
  const scrapMutation = useScrapLoungePost();
  const unscrapMutation = useUnscrapLoungePost();

  const isLikeMutating = likeMutation.isPending || unlikeMutation.isPending;
  const isScrapMutating = scrapMutation.isPending || unscrapMutation.isPending;

  const handleLikeClick = () => {
    if (isLikeMutating) return;
    if (isLiked) {
      unlikeMutation.mutate(postId);
    } else {
      likeMutation.mutate(postId);
    }
  };

  const handleSaveClick = () => {
    if (isScrapMutating) return;
    if (isSaved) {
      unscrapMutation.mutate(postId);
    } else {
      scrapMutation.mutate(postId);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col">
        <div className="-mx-5 border-t border-zinc-300" />

        <div className="-mx-5 flex items-center justify-between pt-[18px]">
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
              <span className="typo-body-sm-regular text-hint min-w-[3ch] tabular-nums">
                {likeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isScrapMutating}
              className="px-5 py-2 rounded-[10px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <Bookmark
                className={`size-4 text-hint ${isSaved ? 'fill-bookmark' : ''}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-sm-regular text-hint">저장</span>
            </button>
          </div>

          <button type="button" className="px-5 py-2 rounded-[10px] flex items-center gap-1.5">
            <Flag className="size-4 text-hint" strokeWidth={1.5} />
            <span className="typo-body-sm-regular text-hint">신고</span>
          </button>
        </div>
      </div>

      <div className="-mx-5 h-2 bg-zinc-300" />
    </div>
  );
}
