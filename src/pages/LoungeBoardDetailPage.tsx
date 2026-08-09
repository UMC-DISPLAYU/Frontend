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

  const [replyState, setReplyState] = useState<{
    commentId: number;
    author: string;
    highlightId: string;
  } | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());

  const clearReplyTarget = () => {
    setReplyState(null);
  };

  const handleReplyClick = useCallback((commentId: number, author: string, highlightId: string) => {
    setReplyState((prev) => {
      if (prev?.highlightId === highlightId) {
        return null;
      }
      return { commentId, author, highlightId };
    });
  }, []);

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      deleteCommentMutation.mutate(
        { postId, commentId: Number(commentId) },
        {
          onSuccess: () => {
            setDeletedCommentIds((prev) => new Set(prev).add(commentId));
          },
        },
      );
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

  const visibleComments = commentsData
    ? commentsData.pages
        .flatMap((page) => page.comments)
        .map((comment) => ({
          comment,
          isDeleted:
            comment.commentStatus === 'DELETED' ||
            deletedCommentIds.has(String(comment.loungeCommentId)),
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
      ) : isValidPost && post ? (
        <>
          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-28 flex flex-col gap-7">
            {/* 게시글 정보 섹션 */}
            <article className="flex flex-col items-center gap-7.5">
              <LoungeBoardPostDetail
                post={post}
                onEdit={() => navigate(`/lounge/${category}/${id}/edit`)}
                onDelete={() =>
                  deletePostMutation.mutate(postId, { onSuccess: () => navigate(-1) })
                }
              />
              <LoungeBoardActionBar
                postId={postId}
                likeCount={post.likeCount}
                isLiked={post.isLiked}
                isSaved={post.isScrapped}
                hasComments={visibleComments.length > 0}
              />
            </article>

            {/* 댓글 정보 섹션 */}
            {visibleComments.length > 0 && (
              <section className="w-full flex flex-col">
                {visibleComments.map(({ comment, isDeleted }) => (
                  <LoungeBoardCommentItem
                    key={comment.loungeCommentId}
                    postId={postId}
                    comment={comment}
                    isDeleted={isDeleted}
                    onDelete={handleDeleteComment}
                    onReplyClick={handleReplyClick}
                    activeReplyId={replyState?.highlightId ?? null}
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
              replyState ? createReplyMutation.isPending : createCommentMutation.isPending
            }
            replyingTo={replyState?.author}
            onCancelReply={clearReplyTarget}
            onSubmit={({ content, images }) => {
              const imageUrls = images.map((image) => image.imageUrl);
              if (replyState) {
                createReplyMutation.mutate(
                  { postId, commentId: replyState.commentId, body: { content, imageUrls } },
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
