import { useState } from 'react';

import { Heart } from 'lucide-react';

import type { LoungeBoardComment } from '@/types/exhibition';

type Props = {
  comment: LoungeBoardComment;
};

export function LoungeBoardCommentItem({ comment }: Props) {
  const [liked, setLiked] = useState(comment.isLiked);
  const displayedLikeCount = comment.likeCount + (liked ? 1 : 0) - (comment.isLiked ? 1 : 0);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="size-7 shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">{comment.author.charAt(0)}</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <span className="typo-body-sm-semibold text-main">{comment.author}</span>
          <span className="typo-body-xs-regular text-hint">{comment.time}</span>
        </div>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className="w-10 h-7 px-2 py-1 rounded-sm flex items-center justify-center gap-0.5"
        >
          <Heart
            className={`size-3 ${liked ? 'fill-heart text-heart' : 'text-faint'}`}
            strokeWidth={1.5}
          />
          <span className="typo-body-xs-regular text-faint">{displayedLikeCount}</span>
        </button>
      </div>

      <p className="pl-9 typo-body-sm-regular text-sub600">{comment.content}</p>
    </div>
  );
}
