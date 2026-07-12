import { useState } from 'react';

import { ChevronDown, Lock, MoreHorizontal, SquarePen } from 'lucide-react';

import DefaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import type { ArtworkGuestbookTab, GuestbookQuestion, GuestbookReview } from '@/types/exhibition';

type Props = {
  reviews: GuestbookReview[];
  questions: GuestbookQuestion[];
};

/* ── 감상 카드 ─────────────────────────────────────────────── */
function ReviewCard({ review }: { review: GuestbookReview }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full overflow-hidden shrink-0">
            <img
              src={DefaultProfileIcon}
              alt="기본 프로필"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[13px] font-bold text-neutral-900 font-['Pretendard']">
              {review.user.nickname}
            </p>
            <p className="text-[11px] text-neutral-400 font-['Pretendard']">{review.createdAt}</p>
          </div>
        </div>
        {/* ⋯ 더보기 버튼 */}
        <button type="button" aria-label="더보기" className="p-1 text-neutral-400">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <p className="text-[13px] text-neutral-600 leading-relaxed font-['Pretendard']">
        {review.content}
      </p>
    </div>
  );
}

/* ── 질문 카드 ─────────────────────────────────────────────── */
function QuestionCard({ question }: { question: GuestbookQuestion }) {
  const [expanded, setExpanded] = useState(!!question.reply);

  const replyStatus = question.reply ? '답변완료' : '답변대기';

  return (
    <div className="border-b border-[#e8e8e8] last:border-b-0">
      {/* 질문 헤더 */}
      <button
        type="button"
        className="w-full py-4 flex items-start justify-between gap-2 text-left"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex-1 min-w-0">
          {!question.isPublic ? (
            /* 비공개 질문 */
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-neutral-500 shrink-0" />
              <span className="text-[13px] font-bold text-neutral-900 font-['Pretendard']">
                비공개 질문입니다.
              </span>
            </div>
          ) : (
            /* 공개 질문 – 아바타 + 닉네임 */
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full overflow-hidden shrink-0">
                <img
                  src={DefaultProfileIcon}
                  alt="기본 프로필"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[13px] font-bold text-neutral-900 font-['Pretendard']">
                {question.user.nickname}
              </span>
            </div>
          )}

          {/* 공개 질문 내용 */}
          {question.isPublic && (
            <p className="text-[13px] text-neutral-600 leading-relaxed font-['Pretendard'] mb-2">
              {question.content}
            </p>
          )}

          {/* 메타 행: 답변상태 · 닉네임 · 날짜 */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-['Pretendard']">
            <span>{replyStatus}</span>
            <span>·</span>
            <span>{question.user.nickname}</span>
            <span>·</span>
            <span>{question.createdAt}</span>
          </div>
        </div>

        {/* 펼치기/접기 화살표 */}
        <ChevronDown
          size={18}
          className={`text-neutral-400 shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 답변 내용 (expanded && reply 있을 때) */}
      {expanded && question.reply && (
        <div className="pb-4 pl-2">
          <p className="text-[13px] text-neutral-600 leading-relaxed font-['Pretendard']">
            {question.reply.content}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export function ArtworkGuestbookTab({ reviews, questions }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookTab>('review');

  return (
    <div className="pb-6">
      {/* 서브탭: 감상 / 질문 */}
      <div className="flex bg-[#D9D9D9] border-b border-[#e5e5e5]">
        {/* 감상 */}
        <button
          type="button"
          id="guestbook-subtab-review"
          onClick={() => setActiveSubTab('review')}
          className="relative flex-1 flex flex-col items-center py-2 transition-colors duration-150"
        >
          <span
            className="text-xs font-['Pretendard']"
            style={{ color: activeSubTab === 'review' ? '#111' : '#aaa' }}
          >
            감상
          </span>
          <span
            className="text-xs font-['Pretendard']"
            style={{
              color: activeSubTab === 'review' ? '#111' : '#aaa',
            }}
          >
            {reviews.length}
          </span>
          {activeSubTab === 'review' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111]" />
          )}
        </button>

        {/* 질문 */}
        <button
          type="button"
          id="guestbook-subtab-question"
          onClick={() => setActiveSubTab('question')}
          className="relative flex-1 flex flex-col items-center py-2 transition-colors duration-150"
        >
          <span
            className="text-xs font-['Pretendard']"
            style={{ color: activeSubTab === 'question' ? '#111' : '#aaa' }}
          >
            질문
          </span>
          <span
            className="text-xs font-['Pretendard']"
            style={{
              color: activeSubTab === 'question' ? '#111' : '#aaa',
            }}
          >
            {questions.length}
          </span>
          {activeSubTab === 'question' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111]" />
          )}
        </button>
      </div>

      {/* ── 감상 탭 ── */}
      {activeSubTab === 'review' && (
        <div className="px-5 pt-2">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-xl font-bold text-neutral-900 font-['Pretendard']">감상 후기</h2>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs text-neutral-400 font-['Pretendard']"
            >
              <SquarePen size={13} />
              후기작성
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {reviews.map((r) => (
              <ReviewCard key={r.feelingId} review={r} />
            ))}
          </div>
          {reviews.length === 0 && (
            <p className="text-[13px] text-neutral-400 text-center py-10 font-['Pretendard']">
              아직 감상 후기가 없습니다.
            </p>
          )}
        </div>
      )}

      {/* ── 질문 탭 ── */}
      {activeSubTab === 'question' && (
        <div className="px-5 pt-2">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-xl font-bold text-neutral-900 font-['Pretendard']">질문하기</h2>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs text-neutral-400 font-['Pretendard']"
            >
              <SquarePen size={13} />
              질문작성
            </button>
          </div>
          {questions.map((q) => (
            <QuestionCard key={q.questionId} question={q} />
          ))}
          {questions.length === 0 && (
            <p className="text-[13px] text-neutral-400 text-center py-10 font-['Pretendard']">
              아직 질문이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
