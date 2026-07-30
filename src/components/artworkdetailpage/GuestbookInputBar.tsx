import { useState } from 'react';

import { Check, Image, SendHorizontal } from 'lucide-react';

import type { ArtworkGuestbookTab } from '@/types/exhibition';
import { cn } from '@/utils/cn';

type GuestbookInputBarProps = {
  activeSubTab: ArtworkGuestbookTab;
  isArtistView?: boolean;
  onSend?: (content: string, isPrivate: boolean) => void;
};

export function GuestbookInputBar({
  activeSubTab,
  isArtistView = false,
  onSend,
}: GuestbookInputBarProps) {
  const [text, setText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // 일반인 시점 질문 탭일 때만 비공개 체크박스 노출
  const showPrivateOption = activeSubTab === 'question' && !isArtistView;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim(), isPrivate);
    setText('');
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-24 bg-page border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)] z-50">
      <div className="w-full h-full relative">
        <div className="absolute top-4 left-5 right-5">
          <form
            onSubmit={handleSubmit}
            className="w-full h-11 px-3 bg-box200 rounded-xl flex items-center justify-between gap-2"
          >
            {/* 비공개 체크박스 옵션 (일반인 시점 질문 탭에서만 노출) */}
            {showPrivateOption && (
              <button
                type="button"
                onClick={() => setIsPrivate((prev) => !prev)}
                className="flex items-center gap-1.5 text-hint hover:text-main cursor-pointer shrink-0 mr-1"
              >
                <div
                  className={cn(
                    'size-4 border border-hint rounded flex items-center justify-center transition-colors',
                    isPrivate && 'bg-main border-main text-white',
                  )}
                >
                  {isPrivate && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="typo-body-xs-regular text-hint">비공개</span>
              </button>
            )}

            {/* 텍스트 입력창 */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="글을 입력하세요."
              className="flex-1 min-w-0 typo-body-sm-regular text-main placeholder:text-faint bg-transparent border-none outline-none"
            />

            {/* 액션 아이콘 (이미지 첨부 + 전송) */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer text-hint hover:text-main transition-colors">
                <Image size={20} />
                <input type="file" accept="image/*" className="hidden" />
              </label>

              <button
                type="submit"
                disabled={!text.trim()}
                className="text-hint hover:text-main disabled:opacity-40 disabled:hover:text-hint cursor-pointer transition-colors"
                aria-label="글 등록"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </form>
        </div>
        <div className="absolute top-[70px] left-0 w-full h-8 overflow-hidden">
          <div className="absolute top-[21px] left-1/2 -translate-x-1/2 w-32 h-[5px] bg-main rounded-[100px]" />
        </div>
      </div>
    </div>
  );
}
