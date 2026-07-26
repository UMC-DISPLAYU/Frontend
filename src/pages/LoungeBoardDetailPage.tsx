import { useParams } from 'react-router-dom';

import {
  LoungeBoardActionBar,
  LoungeBoardCommentItem,
  LoungeBoardHeader,
  LoungeBoardPostDetail,
} from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';
import { useLoungePostDetail } from '@/hooks/queries/useLounge';
import { useLoungeComments } from '@/hooks/queries/useLoungeComments';
import type { LoungeBoardComment, LoungeBoardDetail } from '@/types/exhibition';

const formatDate = (date: string) => date.slice(0, 10).replace(/-/g, '.');

const mapDetail = (
  post: NonNullable<ReturnType<typeof useLoungePostDetail>['data']>,
): LoungeBoardDetail => ({
  id: String(post.loungePostId),
  category: isLoungeCategoryKey(post.category) ? post.category : 'DISPLAY_REVIEW',
  title: post.title,
  author: post.writer.nickname,
  date: formatDate(post.createdAt),
  content: post.content.split('\n').filter(Boolean),
  likeCount: post.likeCount,
  isLiked: post.isLiked,
  isSaved: post.isScrapped,
  images: post.postImageUrls,
  comments: [],
});

const mapComment = (
  comment: NonNullable<ReturnType<typeof useLoungeComments>['data']>['comments'][number],
): LoungeBoardComment => ({
  id: String(comment.loungeCommentId),
  author: comment.writer.nickname,
  time: formatDate(comment.createdAt),
  content: comment.content,
  likeCount: comment.likeCount,
  isLiked: comment.isLiked,
});

export const LoungeBoardDetailPage = () => {
  const { category, id } = useParams<{ category: string; id: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const postId = Number(id);
  const { data: detailData, isLoading: isDetailLoading } = useLoungePostDetail(postId);
  const { data: commentData } = useLoungeComments(postId);
  const review = detailData ? mapDetail(detailData) : undefined;
  const comments = commentData?.comments.map(mapComment) ?? [];
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
          <div className="flex flex-col items-center gap-[30px]">
            <LoungeBoardPostDetail review={{ ...review, comments }} />

            <div className="w-full flex flex-col items-center gap-7">
              <LoungeBoardActionBar
                likeCount={review.likeCount}
                isLiked={review.isLiked}
                isSaved={review.isSaved}
              />

              <div className="w-full flex flex-col gap-4">
                {comments.map((comment) => (
                  <LoungeBoardCommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <p className="typo-body-sm-regular text-hint px-5 pt-5">
          {isDetailLoading ? '불러오는 중...' : '게시글을 찾을 수 없습니다.'}
        </p>
      )}
    </div>
  );
};
