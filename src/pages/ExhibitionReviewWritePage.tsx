import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ImageUploadPlaceholder, PostWriteHeader } from '@/components/post-write';
import { AlertModal, RequiredLabel } from '@/components/ui';

const BASE_INPUT_CLASS =
  'px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 typo-body-xs-regular text-main placeholder:text-faint leading-4';

export function ExhibitionReviewWritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="w-full max-w-105 mx-auto bg-page relative flex flex-col h-dvh">
      <PostWriteHeader title="후기 작성" className="px-5" />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-28">
        <div className="mt-6">
          <ImageUploadPlaceholder />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <RequiredLabel required htmlFor="review-title">
            제목
          </RequiredLabel>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="전시명을 입력해주세요"
            className={BASE_INPUT_CLASS}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <RequiredLabel required htmlFor="review-content">
            내용
          </RequiredLabel>
          <div className="px-3 py-2.5 bg-neutral-50 rounded-lg shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col h-28">
            <textarea
              id="review-content"
              value={content}
              maxLength={500}
              onChange={(e) => setContent(e.target.value)}
              placeholder="전시에 대해 소개해주세요"
              className="flex-1 min-h-0 resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-faint leading-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded"
            />
            <div className="shrink-0 text-right text-faint typo-body-xs-regular leading-4">
              {content.length}/500
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-105 mx-auto bg-neutral-50 border-t border-stone-300 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        <div className="px-5 pt-4 pb-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => setIsSubmitted(true)}
            className={`w-full py-3 rounded-xl typo-body-sm-bold leading-5 ${
              canSubmit ? 'bg-dark text-card' : 'bg-zinc-300 text-neutral-600'
            }`}
          >
            완료
          </button>
        </div>
      </footer>

      {isSubmitted && (
        <AlertModal message="정상적으로 후기가 작성되었습니다." onConfirm={() => navigate(-1)} />
      )}
    </div>
  );
}
