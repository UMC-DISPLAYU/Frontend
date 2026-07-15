import { useState } from 'react';

import { Heart, MoreHorizontal, SquarePen } from 'lucide-react';

import type { ReviewItem } from '@/types/exhibition';

import defaultProfileIcon from '../../assets/DefaultProfileIcon.svg';

/* ReviewCard — ReviewTab 내부에서만 사용 */
function ReviewCard({ item }: { item: ReviewItem }) {
  const [liked, setLiked] = useState(false);
  const likeCount = item.likes + (liked ? 1 : 0);

  return (
    <article className="py-4 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={defaultProfileIcon}
            alt="기본 프로필"
            className="w-8 h-8 rounded-full shrink-0"
          />
          <div className="flex flex-col">
            <p className="typo-body-sm-bold text-main">{item.author}</p>
            <p className="typo-body-xs-regular text-faint">{item.date}</p>
          </div>
        </div>
        <button type="button" aria-label="옵션 더보기">
          <MoreHorizontal size={24} className="text-sub700" />
        </button>
      </div>

      {/* 첨부 이미지 */}
      {item.images && item.images.length > 0 && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {item.images.map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 w-35 aspect-square rounded-lg overflow-hidden bg-box"
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
      <p className="typo-body-xs-regular text-sub600 mb-6">{item.content}</p>

      {/* 좋아요 */}
      <div className="flex items-center">
        <button
          type="button"
          id={`review-like-${item.id}`}
          onClick={() => setLiked((v) => !v)}
          className="flex items-center gap-1 transition-all duration-200 active:scale-95"
        >
          <Heart size={14} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#888'} />
          <span className="typo-body-xs-regular" style={{ color: liked ? '#ef4444' : '#888' }}>
            {likeCount}
          </span>
        </button>
      </div>
    </article>
  );
}

/* ReviewTab */
type Props = {
  reviews: ReviewItem[];
};

export function ReviewTab({ reviews }: Props) {
  return (
    <div className="px-5 py-6">
      {/* 전시 후기 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="typo-body-xl-bold text-main">전시 후기</h1>
        <button className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity">
          <SquarePen size={18} className="text-faint" />
          <span className="typo-body-xs-regular text-faint">후기작성</span>
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
