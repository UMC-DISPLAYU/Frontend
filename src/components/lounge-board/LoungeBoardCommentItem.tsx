import { useState } from 'react';

import { Heart } from 'lucide-react';

import defaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import type { LoungeBoardComment } from '@/types/exhibition';

type Props = {
  comment: LoungeBoardComment;
  isReply?: boolean;
  onDelete?: () => void;
};

export function LoungeBoardCommentItem({ comment, isReply = false, onDelete }: Props) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState(comment.replies ?? []);
  const displayedLikeCount = comment.likeCount + (liked ? 1 : 0) - (comment.isLiked ? 1 : 0);

  return (
    <div className={`w-full flex flex-col gap-2 ${isReply ? 'pl-9' : ''}`}>
      <div className="flex items-center gap-2">
        <img alt="" className="size-7 rounded-full shrink-0" src={defaultProfileIcon} />
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

      <div className="pl-9 flex items-center gap-2">
        {!isReply && (
          <button type="button" className="typo-body-xs-regular text-faint">
            답글달기
          </button>
        )}
        {!isReply && replies.length > 0 && (
          <button
            type="button"
            onClick={() => setRepliesOpen((v) => !v)}
            className="typo-body-xs-regular text-faint"
          >
            댓글{replies.length}
          </button>
        )}
        <button type="button" onClick={onDelete} className="typo-body-xs-regular text-faint">
          삭제
        </button>
      </div>

      {!isReply && repliesOpen && replies.length > 0 && (
        <div className="mt-[32px] flex flex-col gap-[40px]">
          {replies.map((reply) => (
            <LoungeBoardCommentItem
              key={reply.id}
              comment={reply}
              isReply
              onDelete={() => setReplies((prev) => prev.filter((r) => r.id !== reply.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
