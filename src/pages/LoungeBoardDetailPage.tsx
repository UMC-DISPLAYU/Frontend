import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import {
  LoungeBoardActionBar,
  LoungeBoardCommentItem,
  LoungeBoardHeader,
  LoungeBoardPostDetail,
} from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';
import { LOUNGE_BOARD_DETAILS } from '@/mocks/exhibition';

export const LoungeBoardDetailPage = () => {
  const navigate = useNavigate();
  const { category, id } = useParams<{ category: string; id: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const review = id ? LOUNGE_BOARD_DETAILS[id] : undefined;
  const isValidPost = isValidCategory && review && review.category === category;

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        showWriteButton={false}
        className="px-5"
      />

      {isValidPost ? (
        <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
          <div className="flex flex-col items-center gap-7.5">
            <LoungeBoardPostDetail review={review} />

            <div className="w-full flex flex-col items-center gap-7">
              <LoungeBoardActionBar
                likeCount={review.likeCount}
                isLiked={review.isLiked}
                isSaved={review.isSaved}
              />

              <div className="w-full flex flex-col gap-4">
                {review.comments.map((comment) => (
                  <LoungeBoardCommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <ErrorView
          fullScreen={false}
          title="게시글을 찾을 수 없습니다"
          message="요청하신 게시글이 존재하지 않거나 삭제되었습니다."
          onRetry={() => navigate(-1)}
        />
      )}
    </div>
  );
};
