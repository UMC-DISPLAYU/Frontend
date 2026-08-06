import { useEffect, useRef, useState } from 'react';

import { Heart, Lock } from 'lucide-react';

import type {
  ArtworkFeelingDto,
  DisplayDetailDto,
  GetArtworkDetailResponseDataDto,
} from '@/api/dto';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import {
  useDeleteArtworkQuestion,
  useDeleteArtworkQuestionReply,
  useUpdateArtworkQuestion,
} from '@/hooks/queries/useArtworkQuestions';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useQuestionPolicy, useQuestionReplyPolicy } from '@/hooks/usePolicy';
import type { ArtworkGuestbookTab, GuestbookQuestion } from '@/types/exhibition';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkFeelingCommentItem } from './ArtworkFeelingCommentItem';

type Props = {
  feelings: ArtworkFeelingDto[];
  hasMoreFeelings?: boolean;
  onLoadMoreFeelings?: () => void;
  isLoadingMoreFeelings?: boolean;
  questions: GuestbookQuestion[];
  artworkId: number;
  myUserId?: number;
  artwork: GetArtworkDetailResponseDataDto;
  display: DisplayDetailDto;
  isArtist?: boolean;
  /* 상위 탭바(소개/방명록/질문)가 결정한 현재 섹션 */
  activeTab: ArtworkGuestbookTab;
  isArtistView?: boolean;
  onArtistViewChange?: (isArtist: boolean) => void;
  /* 하단 입력바가 답글 대상으로 잡고 있는 감상 id (댓글 하이라이트용) */
  activeReplyId?: number | null;
  onFeelingReplyClick?: (commentId: number, author: string, highlightId: number) => void;
  /* 작가가 답변할 질문 id */
  replyTargetQuestionId?: number | null;
  onQuestionReplyTargetChange?: (question: GuestbookQuestion | null) => void;
};

/* 방명록 질문 탭 카드 (일반인 시점 / 작가 시점 지원) */
function QuestionCard({
  question,
  artworkId,
  artwork,
  display,
  isArtistView = false,
  isReplyTarget = false,
  onReply,
}: {
  question: GuestbookQuestion;
  artworkId: number;
  artwork: GetArtworkDetailResponseDataDto;
  display: DisplayDetailDto;
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
  const deleteQuestionReply = useDeleteArtworkQuestionReply();
  const updateQuestion = useUpdateArtworkQuestion();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const questionPolicy = useQuestionPolicy(question, display);
  const questionReplyPolicy = useQuestionReplyPolicy(question, display, artwork, question.reply);
  const canView = hasPermission(questionPolicy, 'view');
  const canLike = hasPermission(questionPolicy, liked ? 'unlike' : 'like');
  const canDelete = hasPermission(questionPolicy, 'delete');
  const canViewReply = hasPermission(questionReplyPolicy, 'reply.view');
  const canCreateReply = hasPermission(questionReplyPolicy, 'reply.create');
  const canDeleteReply = hasPermission(questionReplyPolicy, 'reply.delete');

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

  const handleReply = () => {
    if (!canCreateReply) {
      openLoginModal();
      return;
    }

    onReply?.();
  };

  const handleDelete = () => {
    if (!canDelete) return;

    deleteQuestion.mutate({ artworkId, questionId: question.questionId });
  };

  const handleLike = () => {
    if (!canLike) {
      openLoginModal();
    }
  };

  const handleDeleteReply = () => {
    const questionReplyId = question.reply?.questionReplyId ?? question.reply?.queReplyId;
    if (!canDeleteReply || !questionReplyId) return;

    deleteQuestionReply.mutate({
      artworkId,
      questionId: question.questionId,
      questionReplyId,
    });
  };

  // 1) 일반인 시점 비공개 질문 카드
  if (!canView) {
    return (
      <article className="w-full">
        <div className="-mx-5 px-5 py-4 border-b border-line flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-main shrink-0" strokeWidth={3} />
            <span className="typo-body-sm-bold text-main">비공개 질문입니다.</span>
          </div>
          <div className="flex items-center gap-2 typo-body-xs-regular text-faint pl-6">
            <span>{formatRelativeTime(question.createdAt)}</span>
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
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      <div className="-mx-5 px-5 py-3 border-b border-line">
        <div className="w-full inline-flex justify-start items-start gap-1.5">
          {/* 프로필 아바타 */}
          <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
            <img
              src={question.user?.profileImageUrl || FALLBACK_PROFILE_IMAGE}
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
                  <span className="typo-body-xs-regular text-faint">
                    {formatRelativeTime(question.createdAt)}
                  </span>
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

            {/* 하단 액션: 답글달기 / 수정 / 삭제 + 좋아요 */}
            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
              <div className="flex justify-start items-center gap-2">
                {/* 질문 답변은 작가만 남길 수 있습니다. */}
                {isArtistView && !question.reply && (
                  <button
                    type="button"
                    onClick={handleReply}
                    className="hover:text-main cursor-pointer"
                  >
                    답글달기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowReplies((prev) => !prev)}
                  className="hover:text-main cursor-pointer"
                >
                  {question.reply ? '답변완료' : '답변대기'}
                </button>
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
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="hover:text-main cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="flex justify-start items-center gap-1">
                {/* 질문 좋아요 API가 없어 표시만 합니다. */}
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-1 text-hint"
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

      {/* 답변 펼치기 내용 */}
      {showReplies && (
        <div className="-mx-5 pl-14 pr-5 py-3 border-b border-line bg-box100/40 flex flex-col gap-2">
          {question.reply && canViewReply ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="typo-body-sm-bold text-main">작가 답변</span>
                  <span className="typo-body-xs-regular text-faint">
                    {formatRelativeTime(question.reply.createdAt)}
                  </span>
                </div>
                {canDeleteReply && (
                  <button
                    type="button"
                    onClick={handleDeleteReply}
                    className="typo-body-xs-regular text-faint hover:text-main"
                  >
                    삭제
                  </button>
                )}
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
      {loginModal}
    </article>
  );
}

/* 방명록 탭(감상/질문) */
export function ArtworkGuestbookTab({
  feelings,
  hasMoreFeelings = false,
  onLoadMoreFeelings,
  isLoadingMoreFeelings = false,
  questions,
  artworkId,
  myUserId,
  artwork,
  display,
  isArtist = false,
  activeTab,
  isArtistView: controlledArtistView,
  onArtistViewChange,
  activeReplyId,
  onFeelingReplyClick,
  replyTargetQuestionId,
  onQuestionReplyTargetChange,
}: Props) {
  const [localArtistView, setLocalArtistView] = useState(isArtist);

  const isArtistView = controlledArtistView ?? localArtistView;

  const feelingsTriggerRef = useRef<HTMLDivElement | null>(null);

  // 감상 목록 무한 스크롤 감지
  useEffect(() => {
    const el = feelingsTriggerRef.current;
    if (!el || activeTab !== 'review') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFeelings && !isLoadingMoreFeelings) {
          onLoadMoreFeelings?.();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMoreFeelings, isLoadingMoreFeelings, onLoadMoreFeelings]);

  const handleArtistViewToggle = () => {
    const nextVal = !isArtistView;
    setLocalArtistView(nextVal);
    onArtistViewChange?.(nextVal);
  };

  return (
    <div className="pb-28">
      {/* ── 감상 탭 ── */}
      {activeTab === 'review' && (
        <div className="px-5 pt-2">
          <div className="py-4">
            <h2 className="typo-body-xl-bold text-main">감상 후기</h2>
          </div>
          <div className="flex flex-col">
            {feelings.map((feeling) => (
              <ArtworkFeelingCommentItem
                key={feeling.feelingId}
                artworkId={artworkId}
                feeling={feeling}
                display={display}
                myUserId={myUserId}
                activeReplyId={activeReplyId}
                onReplyClick={onFeelingReplyClick}
              />
            ))}
          </div>
          {feelings.length === 0 && (
            <p className="typo-body-sm-regular text-faint text-center py-10">
              아직 감상 후기가 없습니다.
            </p>
          )}
          {/* 무한 스크롤 감지 트리거 */}
          <div ref={feelingsTriggerRef} className="h-4" />
          {isLoadingMoreFeelings && (
            <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
              불러오는 중...
            </div>
          )}
        </div>
      )}

      {/* ── 질문 탭 ── */}
      {activeTab === 'question' && (
        <div className="px-5 pt-2">
          <div className="flex items-center justify-between py-4">
            <h2 className="typo-body-xl-bold text-main">질문하기</h2>
            {/* 작가/일반인 시점 전환은 테스트용 — 실제 화면엔 없습니다. */}
            <button
              type="button"
              onClick={handleArtistViewToggle}
              className="px-2.5 py-1 text-xs rounded-full border border-line text-sub600 hover:text-main cursor-pointer"
            >
              {isArtistView ? '작가 시점' : '일반인 시점'}
            </button>
          </div>
          <div className="flex flex-col">
            {questions.map((q) => (
              <QuestionCard
                key={q.questionId}
                question={q}
                artworkId={artworkId}
                artwork={artwork}
                display={display}
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
