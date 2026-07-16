import { useParams } from 'react-router-dom';

import {
  ReviewActionBar,
  ReviewCommentItem,
  ReviewHeader,
  ReviewPostDetail,
} from '@/components/exhibition-review';
import { EXHIBITION_REVIEW_DETAILS } from '@/mocks/exhibition';

export const ExhibitionReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const review = id ? EXHIBITION_REVIEW_DETAILS[id] : undefined;

  if (!review) {
    return (
      <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
        <ReviewHeader showWriteButton={false} />
        <p className="typo-body-sm-regular text-hint px-5 pt-5">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <ReviewHeader showWriteButton={false} className="px-5" />

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        <div className="flex flex-col items-center gap-[30px]">
          <ReviewPostDetail review={review} />

          <div className="w-full flex flex-col items-center gap-7">
            <ReviewActionBar likeCount={review.likeCount} />

            <div className="w-full flex flex-col gap-4">
              {review.comments.map((comment) => (
                <ReviewCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
