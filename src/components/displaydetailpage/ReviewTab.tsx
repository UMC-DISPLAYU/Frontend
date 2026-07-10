import { useState } from 'react';

import { Heart, MoreHorizontal, SquarePen } from 'lucide-react';

import type { ReviewItem } from '@/types/exhibition';

import defaultProfileIcon from '../../assets/DefaultProfileIcon.svg';

/* ------------------------------------------------------------------ */
/* ReviewCard — ReviewTab 내부에서만 사용                               */
/* ------------------------------------------------------------------ */
function ReviewCard({ item }: { item: ReviewItem }) {
  const [liked, setLiked] = useState(false);
  const likeCount = item.likes + (liked ? 1 : 0);

  return (
    <article className="py-5 border-b border-[#ddd] last:border-0 font-[Pretendard,sans-serif]">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={defaultProfileIcon}
            alt="기본 프로필"
            className="w-10 h-10 rounded-full shrink-0"
          />
          <div className="flex flex-col">
            <p className="text-[14px] font-bold text-[#111] leading-tight">{item.author}</p>
            <p className="text-[12px] text-[#888] mt-0.5">{item.date}</p>
          </div>
        </div>
        <button type="button" aria-label="옵션 더보기">
          <MoreHorizontal size={20} color="#888" />
        </button>
      </div>

      {/* 첨부 이미지 (텍스트 위) */}
      {item.images && item.images.length > 0 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {item.images.map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[140px] aspect-square rounded-lg overflow-hidden bg-[#e5e5e5]"
            >
              <img
                src={src}
                alt={`후기 이미지 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 내용 */}
      <p className="text-[13px] text-[#444] leading-relaxed mb-3">{item.content}</p>

      {/* 좋아요 */}
      <div className="flex items-center">
        <button
          type="button"
          id={`review-like-${item.id}`}
          onClick={() => setLiked((v) => !v)}
          className="flex items-center gap-1.5 transition-all duration-200 active:scale-95"
        >
          <Heart size={14} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#888'} />
          <span className="text-[12px]" style={{ color: liked ? '#ef4444' : '#888' }}>
            {likeCount}
          </span>
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ReviewTab                                                            */
/* ------------------------------------------------------------------ */
type Props = {
  reviews: ReviewItem[];
};

export function ReviewTab({ reviews }: Props) {
  return (
    <div className="min-h-[400px] px-5 py-5 font-[Pretendard,sans-serif]">
      {/* 전시 후기 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[#111111] text-xl font-bold">전시 후기</h1>
        <button className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity">
          <SquarePen size={18} color="#aaa" />
          <span className="text-[10px] text-[#aaa] font-medium">후기작성</span>
        </button>
      </div>

      {/* 후기 목록 */}
      <div className="flex flex-col">
        {reviews.map((item) => (
          <ReviewCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
