import { useState } from 'react';

import { Heart, Lock } from 'lucide-react';

import DefaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import {
  useArtworkFeelingReplies,
  useDeleteArtworkFeeling,
  useDeleteArtworkFeelingReply,
  useToggleArtworkFeelingLike,
  useToggleArtworkFeelingReplyLike,
} from '@/hooks/queries/useArtworkFeelings';
import {
  useDeleteArtworkQuestion,
  useUpdateArtworkQuestion,
} from '@/hooks/queries/useArtworkQuestions';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import type {
  ArtworkGuestbookTab,
  GuestbookQuestion,
  GuestbookReview,
  GuestbookReviewReply,
} from '@/types/exhibition';
import { cn } from '@/utils/cn';

type Props = {
  reviews: GuestbookReview[];
  questions: GuestbookQuestion[];
  artworkId: number;
  isArtist?: boolean;
  activeSubTab?: ArtworkGuestbookTab;
  onSubTabChange?: (tab: ArtworkGuestbookTab) => void;
  isArtistView?: boolean;
  onArtistViewChange?: (isArtist: boolean) => void;
  /* 하단 입력바가 답글 대상으로 잡고 있는 감상 id */
  replyTargetFeelingId?: number | null;
  onReplyTargetChange?: (review: GuestbookReview | null) => void;
  /* 작가가 답변할 질문 id */
  replyTargetQuestionId?: number | null;
  onQuestionReplyTargetChange?: (question: GuestbookQuestion | null) => void;
};

/* 방명록 감상 탭 댓글(답글) 카드 */
function ReviewReplyItem({
  reply,
  onLike,
  onDelete,
}: {
  reply: GuestbookReviewReply;
  onLike?: () => void;
  onDelete?: () => void;
}) {
  const liked = reply.isLiked ?? false;
  const likeCount = reply.likeCount ?? 0;

  const handleLike = () => onLike?.();

  return (
    <div className="-mx-5 pl-14 pr-5 py-3 border-b border-line">
      <div className="w-full inline-flex justify-start items-start gap-1.5">
        {/* 프로필 아바타 */}
        <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
          <img
            src={reply.user?.profileImageUrl || DefaultProfileIcon}
            alt={reply.user?.nickname || '사용자'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <div className="w-full h-5 inline-flex justify-start items-center gap-2">
                <div className="flex justify-start items-center gap-2">
                  <span className="typo-body-sm-bold text-main">{reply.user?.nickname}</span>
                  {reply.isArtist && <span className="typo-body-xs-regular text-hint">작가</span>}
                  <span className="typo-body-xs-regular text-hint">{reply.createdAt}</span>
                </div>
              </div>

              <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
                {reply.content}
              </p>
            </div>

            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-hint">
              <div className="flex items-center gap-2">
                {reply.isMyReply && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="hover:text-main cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleLike}
                className="flex items-center gap-1 hover:text-main text-hint cursor-pointer"
              >
                <Heart
                  size={14}
                  className={cn(
                    'transition-colors',
                    liked ? 'fill-main text-main' : 'fill-none text-hint',
                  )}
                />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 방명록 감상 탭 후기 카드 (전시 상세 후기 디자인 적용) */
function ReviewCard({
  review,
  artworkId,
  isReplyTarget = false,
  onReply,
}: {
  review: GuestbookReview;
  artworkId: number;
  isReplyTarget?: boolean;
  onReply?: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;

  const images = review.images ?? [];
  const liked = review.isLiked ?? false;
  const likeCount = review.likeCount ?? 0;

  const toggleLike = useToggleArtworkFeelingLike();
  const deleteFeeling = useDeleteArtworkFeeling();
  const deleteReply = useDeleteArtworkFeelingReply(artworkId, review.feelingId);
  const likeReply = useToggleArtworkFeelingReplyLike(artworkId, review.feelingId);

  /* 답글 목록은 사용자가 펼쳤을 때만 조회합니다. */
  const { data: repliesData } = useArtworkFeelingReplies(
    artworkId,
    review.feelingId,
    showReplies || (review.commentCount ?? 0) > 0,
  );

  /* 답글 응답(ArtworkGuestbookReplyDto)을 화면이 쓰는 형태로 맞춥니다. */
  const replyList: GuestbookReviewReply[] = repliesData?.replies
    ? repliesData.replies.map((reply) => ({
        replyId: reply.feelingReplyId ?? 0,
        content: reply.content,
        createdAt: reply.createdAt,
        user: { userId: reply.userId ?? 0, nickname: reply.nickname ?? '' },
        isArtist: reply.isCreator,
        isMyReply: Boolean(myUserId) && reply.userId === myUserId,
      }))
    : (review.replies ?? []);
  const commentCount = review.commentCount ?? replyList.length;

  const handleLike = () => {
    if (toggleLike.isPending) return;
    toggleLike.mutate({ artworkId, feelingId: review.feelingId });
  };

  return (
    <article
      className={cn(
        'w-full transition-colors',
        // 답글 대상으로 선택되면 어떤 감상에 답글을 다는지 드러나게 강조합니다.
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      {/* 메인 후기 영역 */}
      <div className="-mx-5 px-5 py-3 border-b border-line">
        <div className="w-full inline-flex justify-start items-start gap-1.5">
          {/* 프로필 아바타 */}
          <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
            <img
              src={review.user?.profileImageUrl || DefaultProfileIcon}
              alt={review.user?.nickname || '사용자'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 우측 전체 컨텐츠 Column */}
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex flex-col justify-start items-start gap-1">
                {/* 이름 & 작가 태그(선택) & 날짜 */}
                <div className="w-full h-5 inline-flex justify-start items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <span className="typo-body-sm-bold text-main">{review.user?.nickname}</span>
                    {review.isArtist && (
                      <span className="typo-body-xs-regular text-hint">작가</span>
                    )}
                    <span className="typo-body-xs-regular text-hint">{review.createdAt}</span>
                  </div>
                </div>

                {/* 첨부 이미지 목록 */}
                {images.length > 0 && (
                  <div
                    className="w-full inline-flex justify-start items-start gap-1 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="w-28 h-32 relative rounded-sm overflow-hidden shrink-0 bg-box"
                      >
                        <img
                          src={imgUrl}
                          alt="후기 이미지"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 후기 본문 */}
              <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
                {review.content}
              </p>
            </div>

            {/* 하단 액션: 답글달기 / 댓글 N / 삭제 + 좋아요 */}
            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-hint">
              <div className="flex justify-start items-center gap-2">
                <button type="button" onClick={onReply} className="hover:text-main cursor-pointer">
                  답글달기
                </button>
                {commentCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplies((prev) => !prev)}
                    className="hover:text-main cursor-pointer"
                  >
                    댓글 {commentCount}
                  </button>
                )}
                {review.isMyReview && (
                  <button
                    type="button"
                    onClick={() => deleteFeeling.mutate({ artworkId, feelingId: review.feelingId })}
                    className="hover:text-main cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="flex justify-start items-center gap-1">
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-1 hover:text-main text-hint cursor-pointer"
                >
                  <Heart
                    size={14}
                    className={cn(
                      'transition-colors',
                      liked ? 'fill-main text-main' : 'fill-none text-hint',
                    )}
                  />
                  <span>{likeCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 (답글) 목록 영역 - showReplies 토글시 펼쳐짐 */}
      {showReplies && (
        <div className="flex flex-col">
          {replyList.length > 0 ? (
            replyList.map((reply) => (
              <ReviewReplyItem
                key={reply.replyId}
                reply={reply}
                onLike={() => likeReply.mutate(reply.replyId)}
                onDelete={() => deleteReply.mutate(reply.replyId)}
              />
            ))
          ) : (
            <div className="-mx-5 px-5 py-3 border-b border-line typo-body-xs-regular text-hint">
              등록된 댓글이 없습니다.
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* 방명록 질문 탭 카드 (일반인 시점 / 작가 시점 지원) */
function QuestionCard({
  question,
  artworkId,
  isArtistView = false,
  isReplyTarget = false,
  onReply,
}: {
  question: GuestbookQuestion;
  artworkId: number;
  isArtistView?: boolean;
  isReplyTarget?: boolean;
  onReply?: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(question.content);

  /* 질문에는 좋아요 API가 없어 화면 표시용 값만 사용합니다. */
  const liked = question.isLiked ?? false;
  const likeCount = question.likeCount ?? 0;

  const deleteQuestion = useDeleteArtworkQuestion();
  const updateQuestion = useUpdateArtworkQuestion();

  const submitEdit = () => {
    const content = editContent.trim();
    if (!content || updateQuestion.isPending) return;

    updateQuestion.mutate(
      {
        artworkId,
        questionId: question.questionId,
        body: { content, isPublic: question.isPublic },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const replyStatus = question.reply ? '답변완료' : '답변대기';
  const isSecretForUser = !question.isPublic && !isArtistView && !question.isMyQuestion;

  // 1) 일반인 시점 비공개 질문 카드
  if (isSecretForUser) {
    return (
      <article className="w-full">
        <div className="-mx-5 px-5 py-4 border-b border-line flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-main shrink-0" strokeWidth={3} />
            <span className="typo-body-sm-bold text-main">비공개 질문입니다.</span>
          </div>
          <div className="flex items-center gap-2 typo-body-xs-regular text-faint pl-6">
            <span>{replyStatus}</span>
            <span>{question.createdAt}</span>
          </div>
        </div>
      </article>
    );
  }

  // 2) 공개 질문 카드 및 작가 시점 질문 카드
  return (
    <article
      className={cn(
        'w-full transition-colors',
        // 답변 대상으로 선택되면 어떤 질문에 답하는지 드러나게 강조합니다.
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      <div className="-mx-5 px-5 py-3 border-b border-line">
        <div className="w-full inline-flex justify-start items-start gap-1.5">
          {/* 프로필 아바타 */}
          <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
            <img
              src={question.user?.profileImageUrl || DefaultProfileIcon}
              alt={question.user?.nickname || '사용자'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 우측 전체 컨텐츠 Column */}
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
            <div className="w-full flex flex-col justify-start items-start gap-2">
              {/* 이름 & 날짜 & (비공개인 경우 자물쇠 아이콘 우측 표시) */}
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="typo-body-sm-bold text-main">{question.user?.nickname}</span>
                  <span className="typo-body-xs-regular text-faint">{question.createdAt}</span>
                </div>
                {!question.isPublic && (
                  <Lock size={16} className="text-main shrink-0" strokeWidth={3} />
                )}
              </div>

              {/* 질문 내용 */}
              {editing ? (
                <div className="flex w-full items-center gap-2">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditing(false);
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) submitEdit();
                    }}
                    className="typo-body-xs-regular min-w-0 flex-1 rounded-lg bg-box200 px-3 py-2 text-main outline-none"
                  />
                  <button
                    type="button"
                    onClick={submitEdit}
                    className="typo-body-xs-regular shrink-0 text-link"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="typo-body-xs-regular shrink-0 text-faint"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
                  {question.content}
                </p>
              )}
            </div>

            {/* 하단 액션: 답글달기 / 댓글 N / 삭제 + 좋아요 */}
            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
              <div className="flex justify-start items-center gap-2">
                {/* 질문 답변은 작가만 남길 수 있습니다. */}
                {isArtistView && !question.reply && (
                  <button
                    type="button"
                    onClick={onReply}
                    className="hover:text-main cursor-pointer"
                  >
                    답글달기
                  </button>
                )}
                {(question.commentCount ?? (question.reply ? 1 : 0)) > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplies((prev) => !prev)}
                    className="hover:text-main cursor-pointer"
                  >
                    댓글 {question.commentCount ?? (question.reply ? 1 : 0)}
                  </button>
                )}
                {question.isMyQuestion && !editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditContent(question.content);
                      setEditing(true);
                    }}
                    className="hover:text-main cursor-pointer"
                  >
                    수정
                  </button>
                )}
                {(question.isMyQuestion || isArtistView) && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteQuestion.mutate({ artworkId, questionId: question.questionId })
                    }
                    className="hover:text-main cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="flex justify-start items-center gap-1">
                {/* 질문 좋아요 API가 없어 표시만 합니다. */}
                <div className="flex items-center gap-1 text-hint">
                  <Heart
                    size={14}
                    className={cn(
                      'transition-colors',
                      liked ? 'fill-main text-main' : 'fill-none text-hint',
                    )}
                  />
                  <span>{likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글/답변 펼치기 목록 */}
      {showReplies && (
        <div className="-mx-5 pl-14 pr-5 py-3 border-b border-line bg-box100/40 flex flex-col gap-2">
          {question.reply ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="typo-body-sm-bold text-main">작가 답변</span>
                <span className="typo-body-xs-regular text-faint">{question.reply.createdAt}</span>
              </div>
              <p className="typo-body-xs-regular text-sub600 leading-relaxed">
                {question.reply.content}
              </p>
            </div>
          ) : (
            <p className="typo-body-xs-regular text-faint">등록된 답변이 없습니다.</p>
          )}
        </div>
      )}
    </article>
  );
}

/* 방명록 탭(감상/질문) */
export function ArtworkGuestbookTab({
  reviews,
  questions,
  artworkId,
  isArtist = false,
  activeSubTab: controlledSubTab,
  onSubTabChange,
  isArtistView: controlledArtistView,
  onArtistViewChange,
  replyTargetFeelingId,
  onReplyTargetChange,
  replyTargetQuestionId,
  onQuestionReplyTargetChange,
}: Props) {
  const [localSubTab, setLocalSubTab] = useState<ArtworkGuestbookTab>('review');
  const [localArtistView, setLocalArtistView] = useState(isArtist);

  const activeSubTab = controlledSubTab ?? localSubTab;
  const isArtistView = controlledArtistView ?? localArtistView;

  const handleSubTabChange = (tab: ArtworkGuestbookTab) => {
    setLocalSubTab(tab);
    onSubTabChange?.(tab);
  };

  const handleArtistViewToggle = () => {
    const nextVal = !isArtistView;
    setLocalArtistView(nextVal);
    onArtistViewChange?.(nextVal);
  };

  return (
    <div className="pb-6">
      {/* 서브탭: 감상 / 질문 */}
      <div className="flex bg-bt-gray">
        {/* 감상 */}
        <button
          type="button"
          id="guestbook-subtab-review"
          onClick={() => handleSubTabChange('review')}
          className="relative flex-1 flex flex-col items-center py-1.5 transition-colors duration-150 cursor-pointer"
        >
          <span
            className={cn(
              'typo-body-xs-regular',
              activeSubTab === 'review' ? 'text-main' : 'text-faint',
            )}
          >
            감상
          </span>
          <span
            className={cn(
              'typo-body-xs-regular',
              activeSubTab === 'review' ? 'text-main' : 'text-faint',
            )}
          >
            {reviews.length}
          </span>
          {activeSubTab === 'review' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-main" />
          )}
        </button>

        {/* 질문 */}
        <button
          type="button"
          id="guestbook-subtab-question"
          onClick={() => handleSubTabChange('question')}
          className="relative flex-1 flex flex-col items-center py-1.5 transition-colors duration-150 cursor-pointer"
        >
          <span
            className={cn(
              'typo-body-xs-regular',
              activeSubTab === 'question' ? 'text-main' : 'text-faint',
            )}
          >
            질문
          </span>
          <span
            className={cn(
              'typo-body-xs-regular',
              activeSubTab === 'question' ? 'text-main' : 'text-faint',
            )}
          >
            {questions.length}
          </span>
          {activeSubTab === 'question' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-main" />
          )}
        </button>
      </div>

      {/* ── 감상 탭 ── */}
      {activeSubTab === 'review' && (
        <div className="px-5 pt-2">
          <div className="py-4">
            <h2 className="typo-body-xl-bold text-main">감상 후기</h2>
          </div>
          <div className="flex flex-col">
            {reviews.map((r) => (
              <ReviewCard
                key={r.feelingId}
                review={r}
                artworkId={artworkId}
                isReplyTarget={replyTargetFeelingId === r.feelingId}
                onReply={() =>
                  onReplyTargetChange?.(replyTargetFeelingId === r.feelingId ? null : r)
                }
              />
            ))}
          </div>
          {reviews.length === 0 && (
            <p className="typo-body-sm-regular text-faint text-center py-10">
              아직 감상 후기가 없습니다.
            </p>
          )}
        </div>
      )}

      {/* ── 질문 탭 ── */}
      {activeSubTab === 'question' && (
        <div className="px-5 pt-2">
          <div className="flex items-center justify-between py-4">
            <h2 className="typo-body-xl-bold text-main">질문하기</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleArtistViewToggle}
                className="px-2.5 py-1 text-xs rounded-full border border-line text-sub600 hover:text-main cursor-pointer"
              >
                {isArtistView ? '작가 시점' : '일반인 시점'}
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            {questions.map((q) => (
              <QuestionCard
                key={q.questionId}
                question={q}
                artworkId={artworkId}
                isArtistView={isArtistView}
                isReplyTarget={replyTargetQuestionId === q.questionId}
                onReply={() =>
                  onQuestionReplyTargetChange?.(replyTargetQuestionId === q.questionId ? null : q)
                }
              />
            ))}
          </div>
          {questions.length === 0 && (
            <p className="typo-body-sm-regular text-faint text-center py-10">
              아직 질문이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
