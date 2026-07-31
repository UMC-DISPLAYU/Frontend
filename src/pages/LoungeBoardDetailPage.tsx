import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import {
  LoungeBoardActionBar,
  LoungeBoardCommentItem,
  LoungeBoardHeader,
  LoungeBoardPostDetail,
} from '@/components/lounge-board';
import {
  isLoungeCategoryKey,
  LOUNGE_CATEGORIES,
  toLoungeCategoryKey,
} from '@/constants/loungeCategories';
import { useLoungePostDetail } from '@/hooks/queries/useLounge';
import { useDeleteLoungeComment, useLoungeComments } from '@/hooks/queries/useLoungeComments';
import type { LoungeBoardComment, LoungeBoardDetail } from '@/types/exhibition';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const formatRelativeTime = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export const LoungeBoardDetailPage = () => {
  const navigate = useNavigate();
  const { category, id } = useParams<{ category: string; id: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const postId = id ? Number(id) : NaN;

  const {
    data: post,
    isPending: isPostPending,
    isError: isPostError,
  } = useLoungePostDetail(postId);
  const { data: commentsData, isPending: isCommentsPending } = useLoungeComments(postId);
  const deleteCommentMutation = useDeleteLoungeComment();

  const postCategoryKey = post ? toLoungeCategoryKey(post.category) : undefined;
  const isValidPost = isValidCategory && !!post && postCategoryKey === category;
  const isLoading = isPostPending || isCommentsPending;

  const review: LoungeBoardDetail | undefined =
    isValidPost && commentsData
      ? {
          id: String(post.loungePostId),
          category: postCategoryKey,
          title: post.title,
          author: post.writer.nickname,
          date: formatDate(post.createdAt),
          content: post.content.split('\n').filter((line) => line.length > 0),
          likeCount: post.likeCount,
          isLiked: post.isLiked,
          isSaved: post.isScrapped,
          images: post.postImageUrls.length > 0 ? post.postImageUrls : undefined,
          comments: commentsData.comments.map(
            (comment): LoungeBoardComment => ({
              id: String(comment.loungeCommentId),
              author: comment.writer.nickname,
              time: formatRelativeTime(comment.createdAt),
              content: comment.content,
              likeCount: comment.likeCount,
              isLiked: comment.isLiked,
              replyCount: comment.replyCount,
            }),
          ),
        }
      : undefined;

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        showWriteButton={false}
        className="px-5"
      />

      {!isValidCategory || isPostError ? (
        <ErrorView
          fullScreen={false}
          title="게시글을 찾을 수 없습니다"
          message="요청하신 게시글이 존재하지 않거나 삭제되었습니다."
          onRetry={() => navigate(-1)}
        />
      ) : isLoading ? (
        <LoadingView fullScreen={false} />
      ) : review ? (
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-10">
          <div className="flex flex-col items-center gap-7.5">
            <LoungeBoardPostDetail review={review} />

            <div className="w-full flex flex-col items-center gap-7">
              <LoungeBoardActionBar
                postId={postId}
                likeCount={review.likeCount}
                isLiked={review.isLiked}
                isSaved={review.isSaved}
              />

              <div className="w-full flex flex-col gap-[40px]">
                {review.comments.map((comment) => (
                  <LoungeBoardCommentItem
                    key={comment.id}
                    postId={postId}
                    comment={comment}
                    onDelete={() =>
                      deleteCommentMutation.mutate({ postId, commentId: Number(comment.id) })
                    }
                  />
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
