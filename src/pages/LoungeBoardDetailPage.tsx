import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import {
  LoungeBoardActionBar,
  LoungeBoardCommentInputBar,
  LoungeBoardCommentItem,
  LoungeBoardHeader,
  LoungeBoardPostDetail,
} from '@/components/lounge-board';
import {
  isLoungeCategoryKey,
  LOUNGE_CATEGORIES,
  toLoungeCategoryKey,
} from '@/constants/loungeCategories';
import { useDeleteLoungePost, useLoungePostDetail } from '@/hooks/queries/useLounge';
import {
  useCreateLoungeComment,
  useDeleteLoungeComment,
  useLoungeComments,
} from '@/hooks/queries/useLoungeComments';
import { useCreateLoungeReply } from '@/hooks/queries/useLoungeReplies';
import type { LoungeBoardComment, LoungeBoardDetail } from '@/types/exhibition';
import { formatLoungeTime } from '@/utils/date';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
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
  const createCommentMutation = useCreateLoungeComment();
  const createReplyMutation = useCreateLoungeReply();
  const deletePostMutation = useDeleteLoungePost();

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());

  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };

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
          isMyPost: post.isMyPost,
          images: post.postImageUrls.length > 0 ? post.postImageUrls : undefined,
          comments: commentsData.comments.map(
            (comment): LoungeBoardComment => ({
              id: String(comment.loungeCommentId),
              author: comment.writer.nickname,
              time: formatLoungeTime(comment.createdAt),
              content: comment.content,
              likeCount: comment.likeCount,
              isLiked: comment.isLiked,
              isMyComment: comment.isMyComment,
              replyCount: comment.replyCount,
              commentStatus: comment.commentStatus,
              images: comment.imageUrls.length > 0 ? comment.imageUrls : undefined,
            }),
          ),
        }
      : undefined;

  return (
    <div className="w-full max-w-[402px] mx-auto h-dvh bg-page flex flex-col">
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
        <>
          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-28">
            <div className="flex flex-col items-center gap-7.5">
              <LoungeBoardPostDetail
                review={review}
                onEdit={() => navigate(`/lounge/${category}/${id}/edit`)}
                onDelete={() =>
                  deletePostMutation.mutate(postId, { onSuccess: () => navigate(-1) })
                }
              />

              <div className="w-full flex flex-col items-center gap-7">
                <LoungeBoardActionBar
                  postId={postId}
                  likeCount={review.likeCount}
                  isLiked={review.isLiked}
                  isSaved={review.isSaved}
                />

                <div className="w-full flex flex-col gap-[40px]">
                  {review.comments
                    .map((comment) => ({
                      comment,
                      isDeleted:
                        comment.commentStatus === 'DELETED' || deletedCommentIds.has(comment.id),
                    }))
                    // 답글 없는 삭제된 부모 댓글은 목록에서 완전히 제외
                    .filter(
                      ({ isDeleted, comment }) => !(isDeleted && (comment.replyCount ?? 0) === 0),
                    )
                    .map(({ comment, isDeleted }) => (
                      <LoungeBoardCommentItem
                        key={comment.id}
                        postId={postId}
                        comment={comment}
                        isDeleted={isDeleted}
                        onDelete={() => {
                          deleteCommentMutation.mutate({ postId, commentId: Number(comment.id) });
                          setDeletedCommentIds((prev) => new Set(prev).add(comment.id));
                        }}
                        onReplyClick={(commentId, author, highlightId) => {
                          setReplyTarget({ commentId, author });
                          setActiveReplyId(highlightId);
                        }}
                        activeReplyId={activeReplyId}
                      />
                    ))}
                </div>
              </div>
            </div>
          </main>

          <LoungeBoardCommentInputBar
            replyTarget={replyTarget}
            onCancelReply={clearReplyTarget}
            onSubmitComment={(content, imageUrls) =>
              createCommentMutation.mutate({ postId, body: { content, imageUrls } })
            }
            onSubmitReply={(commentId, content, imageUrls) =>
              createReplyMutation.mutate(
                { postId, commentId, body: { content, imageUrls } },
                { onSuccess: clearReplyTarget },
              )
            }
          />
        </>
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
