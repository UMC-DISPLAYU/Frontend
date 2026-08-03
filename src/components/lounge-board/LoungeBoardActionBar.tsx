import { useState } from 'react';

import { Bookmark, Heart } from 'lucide-react';

type Props = {
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
};

export function LoungeBoardActionBar({ likeCount, isLiked, isSaved }: Props) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const displayedLikeCount = likeCount + (liked ? 1 : 0) - (isLiked ? 1 : 0);

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col">
        <div className="-mx-5 border-t border-zinc-300" />

        <div className="-mx-5 flex items-center pt-[18px]">
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
              {/* 저장됨 아이콘 색 임시로 피그마 값을 하드코딩했습니다(서현민) */}
              <Bookmark
                className={`size-4 ${saved ? 'text-[#C4C4C4] fill-[#C4C4C4]' : 'text-hint'}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-sm-regular text-hint">저장</span>
            </button>
          </div>
        </div>
      </div>

      <div className="-mx-5 h-1 bg-zinc-300" />
    </div>
  );
}
