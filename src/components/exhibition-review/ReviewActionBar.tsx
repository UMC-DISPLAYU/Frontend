import { useState } from 'react';

import { Bookmark, Flag, Heart } from 'lucide-react';

type Props = {
  likeCount: number;
};

export function ReviewActionBar({ likeCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const displayedLikeCount = likeCount + (liked ? 1 : 0);

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col">
        <div className="-mx-5 border-t border-zinc-300" />

        <div className="-mx-5 flex items-center justify-between pt-[18px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className="px-5 py-2 rounded-[10px] flex items-center gap-1.5"
            >
              <Heart
                className={`size-5 ${liked ? 'fill-heart text-heart' : 'text-faint'}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-sm-regular text-hint">{displayedLikeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className="px-5 py-2 rounded-[10px] flex items-center gap-1.5"
            >
              <Bookmark
                className={`size-4 text-hint ${saved ? 'fill-bookmark' : ''}`}
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
