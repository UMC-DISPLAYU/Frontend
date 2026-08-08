import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, ChevronUp, Lock, Plus, X } from 'lucide-react';

import type {
  ArtworkFeelingDto,
  DisplayDetailDto,
  GetArtworkDetailResponseDataDto,
} from '@/api/dto';
import { useQuestionPolicy } from '@/hooks/usePolicy';
import type { ArtworkGuestbookTab, GuestbookQuestion } from '@/types/exhibition';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkFeelingCommentItem } from './ArtworkFeelingCommentItem';

/* 스크롤 대신 박스 자체가 늘어나도록 내용에 맞춰 textarea 높이를 맞춥니다. */
function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

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
  activeReplyId?: string | null;
  onFeelingReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  /* 작가가 답변할 질문 id */
  replyTargetQuestionId?: number | null;
  onQuestionReplyTargetChange?: (question: GuestbookQuestion | null) => void;
  onAddQuestionClick?: () => void;
  /* 새 질문 작성 카드가 열려 있는지 여부 */
  isComposingQuestion?: boolean;
  onCloseComposeQuestion?: () => void;
  onSubmitQuestion?: (payload: { content: string; isPrivate: boolean }) => void;
  isSubmittingQuestion?: boolean;
};

/* 방명록 질문 탭 카드 (일반인 시점 / 작가 시점 지원) */
function QuestionCard({
  question,
  display,
  artistName,
  isArtistView = false,
  isReplyTarget = false,
  onReply,
  onSubmitReply,
  isSubmittingReply = false,
}: {
  question: GuestbookQuestion;
  display: DisplayDetailDto;
  /* 답변 작성 카드에 표시되는 전시 대표 작가 이름 */
  artistName?: string;
  isArtistView?: boolean;
  isReplyTarget?: boolean;
  onReply?: () => void;
  onSubmitReply?: (content: string) => void;
  isSubmittingReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const replyTextareaRef = useAutoResizeTextarea(replyContent);
  const questionPolicy = useQuestionPolicy(question, display);
  const canView = hasPermission(questionPolicy, 'view');

  /*
   * 답변할 질문이 없어졌으면(답변 등록 성공 등) 작성 중이던 입력값을 비웁니다.
   * effect 대신 렌더링 중 상태를 조정하는 방식(React 공식 권장 패턴)을 씁니다.
   */
  const [prevIsReplyTarget, setPrevIsReplyTarget] = useState(isReplyTarget);
  if (isReplyTarget !== prevIsReplyTarget) {
    setPrevIsReplyTarget(isReplyTarget);
    if (!isReplyTarget) setReplyContent('');
  }

  /* 이 질문에 답변을 작성 중인지 — 작가만 가능합니다. */
  const isComposingReply = isArtistView && isReplyTarget && !question.reply;

  const handleFooterClick = () => {
    if (isArtistView && !question.reply) {
      onReply?.();
      return;
    }
    setShowReplies((prev) => !prev);
  };

  const handleSubmitReply = () => {
    const trimmed = replyContent.trim();
    if (!trimmed || isSubmittingReply) return;
    onSubmitReply?.(trimmed);
  };

  return (
    <article className="w-full px-5 pb-3.5">
      <div className="w-full overflow-hidden rounded-[18px] bg-card shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
        {!canView ? (
          <div className="flex flex-col items-start gap-1 px-4 py-3.5">
            <div className="flex h-[50px] items-center gap-3 self-stretch">
              <Lock size={16} className="text-main shrink-0" strokeWidth={3} />
              <div className="flex w-[280px] shrink-0 flex-col items-start gap-1">
                <span className="typo-body-md-bold text-main">비공개 질문입니다.</span>
                <span className="typo-body-xs-regular text-sub600">
                  {formatRelativeTime(question.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1 px-4 py-3.5">
            <p className="w-full typo-body-md-regular text-main wrap-break-word whitespace-pre-line">
              {question.content}
            </p>
            <div className="flex items-start gap-2">
              <span className="typo-body-xs-regular text-sub600">{question.user?.nickname}</span>
              <span className="typo-body-xs-regular text-sub600">
                {formatRelativeTime(question.createdAt)}
              </span>
            </div>
          </div>
        )}

        {isComposingReply ? (
          <div className="border-t border-box200">
            <button
              type="button"
              onClick={() => onReply?.()}
              className="flex h-[52px] w-full items-center justify-between gap-0.5 px-4 pt-4 pb-2 cursor-pointer"
            >
              <span className="w-[271px] shrink-0 truncate text-left typo-body-xs-regular text-link">
                {artistName}
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <span className="typo-body-xs-regular text-sub600 underline">답변대기</span>
                <ChevronDown size={13} className="shrink-0 text-sub600" />
              </span>
            </button>

            <div className="flex flex-col items-center gap-2 self-stretch px-4 pb-4">
              <div className="flex min-h-[105px] w-full flex-col items-start justify-between">
                <textarea
                  ref={replyTextareaRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value.slice(0, QUESTION_MAX_LENGTH))}
                  placeholder="답변을 작성해주세요"
                  rows={1}
                  className="typo-body-xs-regular min-h-[80px] w-full resize-none overflow-hidden bg-transparent text-main outline-none placeholder:text-faint"
                />
                <div className="flex w-full items-center justify-between">
                  <button type="button" className="typo-body-sm-regular text-faint underline">
                    사진추가
                  </button>
                  <span className="typo-body-xs-regular text-faint">
                    {replyContent.length}/{QUESTION_MAX_LENGTH}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isSubmittingReply}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[52px] bg-box100 disabled:opacity-50"
              >
                <span className="text-[18px] leading-[140%] tracking-[-0.45px] text-main">
                  확인
                </span>
              </button>
            </div>
          </div>
        ) : question.reply ? (
          <button
            type="button"
            onClick={handleFooterClick}
            className="flex w-full items-center justify-end gap-0.5 border-t border-box200 px-4 pt-4 pb-2 cursor-pointer"
          >
            <span className="w-[271px] shrink-0 truncate text-left typo-body-xs-regular text-link">
              {artistName}
            </span>
            <span className="typo-body-xs-regular text-sub600 underline">답변완료</span>
            {showReplies && <ChevronUp size={13} className="shrink-0 text-sub600" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFooterClick}
            className="flex w-full items-center justify-end gap-0.5 border-t border-box200 p-4 cursor-pointer"
          >
            <span className="typo-body-xs-regular text-sub600 underline">답변대기</span>
            {showReplies && <ChevronDown size={13} className="shrink-0 text-sub600" />}
          </button>
        )}

        {showReplies && !isComposingReply && (
          <div className="flex flex-col px-4 pb-3.5">
            {question.reply ? (
              <>
                <p className="typo-body-md-regular text-main wrap-break-word whitespace-pre-line">
                  {question.reply.content}
                </p>
                <span className="typo-body-xs-regular mt-1 text-sub600">
                  {formatRelativeTime(question.reply.createdAt)}
                </span>
              </>
            ) : (
              <p className="typo-body-xs-regular text-faint">등록된 답변이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

const QUESTION_MAX_LENGTH = 300;

function QuestionComposerCard({
  onClose,
  onSubmit,
  isSubmitting = false,
}: {
  onClose: () => void;
  onSubmit: (payload: { content: string; isPrivate: boolean }) => void;
  isSubmitting?: boolean;
}) {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const textareaRef = useAutoResizeTextarea(content);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit({ content: trimmed, isPrivate });
  };

  return (
    <article className="w-full px-5 pt-1 pb-3.5">
      <div className="flex w-full flex-col items-start gap-2 self-stretch rounded-[18px] bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
        {/* 질문작성 / 닫기 */}
        <div className="flex items-center justify-between self-stretch">
          <span className="typo-body-sm-bold text-main">질문작성</span>
          <button type="button" onClick={onClose} aria-label="닫기" className="cursor-pointer">
            <X size={20} strokeWidth={1.5} className="text-main" />
          </button>
        </div>

        <div className="flex min-h-[105px] w-full flex-col items-start justify-between">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, QUESTION_MAX_LENGTH))}
            placeholder="질문을 작성해주세요"
            rows={1}
            className="typo-body-xs-regular min-h-[80px] w-full resize-none overflow-hidden bg-transparent text-main outline-none placeholder:text-faint"
          />
          <span className="typo-body-xs-regular w-full text-right text-faint">
            {content.length}/{QUESTION_MAX_LENGTH}
          </span>
        </div>

        <div className="flex items-start justify-between self-stretch">
          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            aria-pressed={isPrivate}
            className="flex cursor-pointer items-center gap-1.5"
          >
            <span
              className={cn(
                'flex size-3 items-center justify-center rounded-[1px] border transition-colors',
                isPrivate ? 'border-main' : 'border-faint',
              )}
            >
              {isPrivate && <Check size={10} strokeWidth={3} className="text-main" />}
            </span>
            <span className={cn('typo-body-sm-regular', isPrivate ? 'text-main' : 'text-faint')}>
              비공개
            </span>
          </button>
          <button type="button" className="typo-body-sm-regular text-faint underline">
            사진추가
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[52px] bg-box100 disabled:opacity-50"
        >
          <span className="text-[18px] leading-[140%] tracking-[-0.45px] text-main">확인</span>
        </button>
      </div>
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
  onAddQuestionClick,
  isComposingQuestion = false,
  onCloseComposeQuestion,
  onSubmitQuestion,
  isSubmittingQuestion = false,
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
    <div className="pb-28 min-h-150">
      {/* ── 감상 탭 ── */}
      {activeTab === 'review' && (
        <div className="px-5 pt-4">
          <div className="pb-4">
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
        <div className="pt-4">
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="typo-body-xl-bold text-main">질문하기</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleArtistViewToggle}
                className="px-2.5 py-1 text-xs rounded-full border border-line text-sub600 hover:text-main cursor-pointer"
              >
                {isArtistView ? '작가 시점' : '일반인 시점'}
              </button>
              <button
                type="button"
                aria-label="질문 작성"
                onClick={onAddQuestionClick}
                className="mr-[15px] cursor-pointer"
              >
                <Plus size={17} strokeWidth={2} className="text-main" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            {isComposingQuestion && (
              <QuestionComposerCard
                onClose={() => onCloseComposeQuestion?.()}
                onSubmit={(payload) => onSubmitQuestion?.(payload)}
                isSubmitting={isSubmittingQuestion}
              />
            )}
            {questions.map((q) => (
              <QuestionCard
                key={q.questionId}
                question={q}
                display={display}
                artistName={artwork.artistName}
                isArtistView={isArtistView}
                isReplyTarget={replyTargetQuestionId === q.questionId}
                onReply={() =>
                  onQuestionReplyTargetChange?.(replyTargetQuestionId === q.questionId ? null : q)
                }
                onSubmitReply={(content) => onSubmitQuestion?.({ content, isPrivate: false })}
                isSubmittingReply={isSubmittingQuestion}
              />
            ))}
          </div>
          {questions.length === 0 && (
            <p className="typo-body-sm-regular text-faint text-center px-5 py-10">
              아직 질문이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
