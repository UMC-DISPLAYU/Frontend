import { useState } from 'react';

import type { ArtworkGuestbookTab, GuestbookQuestion, GuestbookReview } from '@/types/exhibition';

import duLogo from '../../assets/logo.svg';

type Props = {
  reviews: GuestbookReview[];
  questions: GuestbookQuestion[];
};

function ReviewCard({ review }: { review: GuestbookReview }) {
  return (
    <div className="py-4 border-b border-[#f0f0f0]">
      <div className="flex items-center gap-2 mb-2">
        <div className="size-8 rounded-full bg-[#ddd] overflow-hidden shrink-0">
          <img
            src={`https://picsum.photos/seed/${review.user.nickname}/32/32`}
            alt={review.user.nickname}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#111] font-[Pretendard,sans-serif]">
            {review.user.nickname}
          </p>
          <p className="text-[11px] text-[#aaa] font-[Pretendard,sans-serif]">{review.createdAt}</p>
        </div>
      </div>
      <p className="text-[13px] text-[#555] leading-relaxed font-[Pretendard,sans-serif]">
        {review.content}
      </p>
    </div>
  );
}

function QuestionCard({ question }: { question: GuestbookQuestion }) {
  return (
    <div className="border border-[#e8e8e8] rounded-xl mb-3 overflow-hidden">
      {/* 질문 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {!question.isPublic && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          <span className="text-[13px] text-[#555] font-[Pretendard,sans-serif]">
            {!question.isPublic ? '비공개 질문입니다.' : question.user.nickname}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#aaa] font-[Pretendard,sans-serif]">
            {question.createdAt}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {/* 답변 */}
      {question.reply && (
        <div className="bg-[#f8f8f8] border-t border-[#e8e8e8] px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-full bg-[#ddd] overflow-hidden">
              <img
                src={`https://picsum.photos/seed/artist/24/24`}
                alt="Artist"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#111] font-[Pretendard,sans-serif]">
                작가
              </span>
              <span className="text-[11px] text-[#aaa] ml-2 font-[Pretendard,sans-serif]">
                {question.reply.createdAt}
              </span>
            </div>
          </div>
          <p className="text-[13px] text-[#555] leading-relaxed font-[Pretendard,sans-serif]">
            {question.reply.content}
          </p>
        </div>
      )}
    </div>
  );
}

export function ArtworkGuestbookTab({ reviews, questions }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookTab>('review');

  return (
    <div className="pb-32">
      {/* 서브탭: 감상 / 질문 */}
      <div className="flex border-b border-[#e5e5e5] px-5">
        <button
          type="button"
          id="guestbook-subtab-review"
          onClick={() => setActiveSubTab('review')}
          className="relative py-3 mr-8 text-[13px] font-[Pretendard,sans-serif] transition-colors duration-150"
          style={{
            color: activeSubTab === 'review' ? '#111' : '#aaa',
            fontWeight: activeSubTab === 'review' ? 700 : 400,
          }}
        >
          감상 {reviews.length}
          {activeSubTab === 'review' && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#111]" />
          )}
        </button>
        <button
          type="button"
          id="guestbook-subtab-question"
          onClick={() => setActiveSubTab('question')}
          className="relative py-3 text-[13px] font-[Pretendard,sans-serif] transition-colors duration-150"
          style={{
            color: activeSubTab === 'question' ? '#111' : '#aaa',
            fontWeight: activeSubTab === 'question' ? 700 : 400,
          }}
        >
          질문 {questions.length}
          {activeSubTab === 'question' && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#111]" />
          )}
        </button>
      </div>

      {activeSubTab === 'review' && (
        <div className="px-5">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-[16px] font-bold text-[#111] font-[Pretendard,sans-serif]">
              감상 후기
            </h2>
            <button type="button" className="text-[12px] text-[#888] font-[Pretendard,sans-serif]">
              후기작성
            </button>
          </div>
          {reviews.map((r) => (
            <ReviewCard key={r.feelingId} review={r} />
          ))}
          {reviews.length === 0 && (
            <p className="text-[13px] text-[#aaa] text-center py-10 font-[Pretendard,sans-serif]">
              아직 감상 후기가 없습니다.
            </p>
          )}
        </div>
      )}

      {activeSubTab === 'question' && (
        <div className="px-5">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-[16px] font-bold text-[#111] font-[Pretendard,sans-serif]">
              질문하기
            </h2>
            <button type="button" className="text-[12px] text-[#888] font-[Pretendard,sans-serif]">
              질문작성
            </button>
          </div>
          {questions.map((q) => (
            <QuestionCard key={q.questionId} question={q} />
          ))}
          {questions.length === 0 && (
            <p className="text-[13px] text-[#aaa] text-center py-10 font-[Pretendard,sans-serif]">
              아직 질문이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 푸터 */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <img src={duLogo} alt="DU" className="h-8" />
          <div>
            <p className="text-[11px] text-[#888] font-[Pretendard,sans-serif]">전시공유 플랫폼</p>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-[11px] text-[#aaa] font-[Pretendard,sans-serif]">
          <span>PM 고상준</span>
          <span>DESIGN 최유성</span>
          <span>FrontEnd</span>
          <span>BackEnd</span>
        </div>
      </section>
    </div>
  );
}
