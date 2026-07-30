import { useState } from 'react';

import { Heart, Lock } from 'lucide-react';

import DefaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
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
  isArtist?: boolean;
  activeSubTab?: ArtworkGuestbookTab;
  onSubTabChange?: (tab: ArtworkGuestbookTab) => void;
  isArtistView?: boolean;
  onArtistViewChange?: (isArtist: boolean) => void;
};

/* 방명록 감상 탭 댓글(답글) 카드 */
function ReviewReplyItem({ reply }: { reply: GuestbookReviewReply }) {
  const [liked, setLiked] = useState(reply.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(reply.likeCount ?? 12);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

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
                <button type="button" className="hover:text-main cursor-pointer">
                  답글달기
                </button>
                {reply.isMyReply && (
                  <button type="button" className="hover:text-main cursor-pointer">
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
function ReviewCard({ review }: { review: GuestbookReview }) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(review.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(review.likeCount ?? 12);

  const images = review.images ?? [];
  const replyList = review.replies ?? [];
  const commentCount = review.commentCount ?? replyList.length;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <article className="w-full">
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
                <button
                  type="button"
                  onClick={() => setShowReplies((prev) => !prev)}
                  className="hover:text-main cursor-pointer"
                >
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
                  <button type="button" className="hover:text-main cursor-pointer">
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
            replyList.map((reply) => <ReviewReplyItem key={reply.replyId} reply={reply} />)
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
  isArtistView = false,
}: {
  question: GuestbookQuestion;
  isArtistView?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(question.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(question.likeCount ?? 12);

  const replyStatus = question.reply ? '답변완료' : '답변대기';
  const isSecretForUser = !question.isPublic && !isArtistView && !question.isMyQuestion;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

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
    <article className="w-full">
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
              <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
                {question.content}
              </p>
            </div>

            {/* 하단 액션: 답글달기 / 댓글 N / 삭제 + 좋아요 */}
            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
              <div className="flex justify-start items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplies((prev) => !prev)}
                  className="hover:text-main cursor-pointer"
                >
                  답글달기
                </button>
                {(question.commentCount ?? (question.reply ? 1 : 0)) > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplies((prev) => !prev)}
                    className="hover:text-main cursor-pointer"
                  >
                    댓글 {question.commentCount ?? (question.reply ? 1 : 0)}
                  </button>
                )}
                {(question.isMyQuestion || isArtistView) && (
                  <button type="button" className="hover:text-main cursor-pointer">
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
  isArtist = false,
  activeSubTab: controlledSubTab,
  onSubTabChange,
  isArtistView: controlledArtistView,
  onArtistViewChange,
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
              <ReviewCard key={r.feelingId} review={r} />
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
              <QuestionCard key={q.questionId} question={q} isArtistView={isArtistView} />
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
