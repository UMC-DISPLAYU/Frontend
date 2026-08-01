import { useEffect, useRef, useState } from 'react';

import { Image, SendHorizontal, X } from 'lucide-react';

type ReplyTarget = {
  commentId: number;
  author: string;
};

type Props = {
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
  onSubmitComment: (content: string) => void;
  onSubmitReply: (commentId: number, content: string) => void;
};

export function LoungeBoardCommentInputBar({
  replyTarget,
  onCancelReply,
  onSubmitComment,
  onSubmitReply,
}: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const replyKey = replyTarget?.commentId ?? null;
  const [prevReplyKey, setPrevReplyKey] = useState(replyKey);
  if (replyKey !== prevReplyKey) {
    setPrevReplyKey(replyKey);
    setText('');
  }

  useEffect(() => {
    if (replyTarget) {
      inputRef.current?.focus();
    }
  }, [replyTarget]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    if (replyTarget) {
      onSubmitReply(replyTarget.commentId, trimmed);
    } else {
      onSubmitComment(trimmed);
    }
    setText('');
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] bg-page border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)] z-50">
      {replyTarget && (
        <div className="flex items-center justify-between px-5 pt-3">
          <span className="typo-body-xs-regular text-hint">
            {replyTarget.author}님에게 답글 남기는 중
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="답글 취소"
            className="text-hint hover:text-main"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="px-5 py-4">
        <form
          onSubmit={handleSubmit}
          className="w-full h-11 px-3 bg-box200 rounded-xl flex items-center justify-between gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="글을 입력하세요."
            className="flex-1 min-w-0 typo-body-sm-regular text-main placeholder:text-faint bg-transparent border-none outline-none"
          />

          <div className="flex items-center gap-2 shrink-0">
            <label className="cursor-pointer text-hint hover:text-main transition-colors">
              <Image size={20} />
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <button
              type="submit"
              disabled={!text.trim()}
              className="text-hint hover:text-main disabled:opacity-40 disabled:hover:text-hint cursor-pointer transition-colors"
              aria-label="댓글 등록"
            >
              <SendHorizontal size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
