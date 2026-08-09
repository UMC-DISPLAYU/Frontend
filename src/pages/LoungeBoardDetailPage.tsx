import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BottomCommentBar, ErrorView, LoadingView } from '@/components/common';
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
import { useDeleteLoungePost, useLoungePostDetail } from '@/hooks/queries/useLounge';
import {
  useCreateLoungeComment,
  useDeleteLoungeComment,
  useLoungeComments,
} from '@/hooks/queries/useLoungeComments';
import { useCreateLoungeReply } from '@/hooks/queries/useLoungeReplies';
import type { LoungeBoardComment, LoungeBoardDetail } from '@/types/exhibition';
import { formatRelativeTime } from '@/utils/date';

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
  const {
    data: commentsData,
    isPending: isCommentsPending,
    isError: isCommentsError,
    refetch: refetchComments,
    hasNextPage: hasMoreComments,
    fetchNextPage: fetchMoreComments,
    isFetchingNextPage: isFetchingMoreComments,
  } = useLoungeComments(postId);
  const deleteCommentMutation = useDeleteLoungeComment();
  const createCommentMutation = useCreateLoungeComment();
  const createReplyMutation = useCreateLoungeReply();
  const deletePostMutation = useDeleteLoungePost();

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());

  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };

  const handleReplyClick = useCallback((commentId: number, author: string, highlightId: string) => {
    setActiveReplyId((prev) => {
      if (prev === highlightId) {
        setReplyTarget(null);
        return null;
      }
      setReplyTarget({ commentId, author });
      return highlightId;
    });
  }, []);

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      deleteCommentMutation.mutate({ postId, commentId: Number(commentId) });
      setDeletedCommentIds((prev) => new Set(prev).add(commentId));
    },
    [deleteCommentMutation, postId],
  );

  const commentsTriggerRef = useRef<HTMLDivElement | null>(null);

  // 댓글 목록 무한 스크롤 감지
  useEffect(() => {
    const el = commentsTriggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreComments && !isFetchingMoreComments) {
          fetchMoreComments();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreComments, isFetchingMoreComments, fetchMoreComments]);

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
          comments: commentsData.pages
            .flatMap((page) => page.comments)
            .map(
              (comment): LoungeBoardComment => ({
                id: String(comment.loungeCommentId),
                author: comment.writer.nickname,
                avatarUrl: comment.writer.profileImageUrl,
                time: formatRelativeTime(comment.createdAt),
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

  const visibleComments = review
    ? review.comments
        .map((comment) => ({
          comment,
          isDeleted: comment.commentStatus === 'DELETED' || deletedCommentIds.has(comment.id),
        }))
        .filter(({ isDeleted, comment }) => !(isDeleted && (comment.replyCount ?? 0) === 0))
    : [];

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
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
      ) : isValidPost && isCommentsError ? (
        <ErrorView
          fullScreen={false}
          title="댓글을 불러오지 못했습니다"
          message="잠시 후 다시 시도해주세요."
          onRetry={() => refetchComments()}
        />
      ) : review ? (
        <>
          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-28 flex flex-col gap-7">
            {/* 게시글 정보 섹션 */}
            <article className="flex flex-col items-center gap-7.5">
              <LoungeBoardPostDetail
                review={review}
                onEdit={() => navigate(`/lounge/${category}/${id}/edit`)}
                onDelete={() =>
                  deletePostMutation.mutate(postId, { onSuccess: () => navigate(-1) })
                }
              />
              <LoungeBoardActionBar
                postId={postId}
                likeCount={review.likeCount}
                isLiked={review.isLiked}
                isSaved={review.isSaved}
                hasComments={visibleComments.length > 0}
              />
            </article>

            {/* 댓글 정보 섹션 */}
            {visibleComments.length > 0 && (
              <section className="w-full flex flex-col">
                {visibleComments.map(({ comment, isDeleted }) => (
                  <LoungeBoardCommentItem
                    key={comment.id}
                    postId={postId}
                    comment={comment}
                    isDeleted={isDeleted}
                    onDelete={handleDeleteComment}
                    onReplyClick={handleReplyClick}
                    activeReplyId={activeReplyId}
                  />
                ))}
                <div ref={commentsTriggerRef} className="h-4" />
                {isFetchingMoreComments && (
                  <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
                    불러오는 중...
                  </div>
                )}
              </section>
            )}
          </main>

          <BottomCommentBar
            placeholder="댓글을 입력하세요."
            imageDomain="lounge"
            isSubmitting={
              replyTarget ? createReplyMutation.isPending : createCommentMutation.isPending
            }
            replyingTo={replyTarget?.author}
            onCancelReply={clearReplyTarget}
            onSubmit={({ content, images }) => {
              const imageUrls = images.map((image) => image.imageUrl);
              if (replyTarget) {
                createReplyMutation.mutate(
                  { postId, commentId: replyTarget.commentId, body: { content, imageUrls } },
                  { onSuccess: clearReplyTarget },
                );
                return;
              }
              createCommentMutation.mutate({ postId, body: { content, imageUrls } });
            }}
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
