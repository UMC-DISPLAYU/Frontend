import { useState } from 'react';

import { Share2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { ShareBottomSheet } from '@/components/common';

type Props = {
  button: ReactNode;
  /* 공유 시트에 쓸 제목(전시/작품 이름) */
  shareTitle: string;
  shareDescription?: string;
  shareImageUrl?: string;
};

export function BottomFixedBar({ button, shareTitle, shareDescription, shareImageUrl }: Props) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-line px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+32px)] flex items-center justify-between z-50">
      <button
        type="button"
        onClick={() => setIsShareOpen(true)}
        aria-label="공유하기"
        className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer"
      >
        <Share2 size={24} className="text-sub700" />
      </button>

      <div className="flex-1 ml-2">{button}</div>

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={shareTitle}
        description={shareDescription}
        imageUrl={shareImageUrl}
      />
    </div>
  );
}
