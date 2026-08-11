import { useState } from 'react';

import { Share2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { BottomFixedBar as CommonBottomFixedBar, ShareBottomSheet } from '@/components/common';

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
    <CommonBottomFixedBar>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          aria-label="공유하기"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center"
        >
          <Share2 size={24} className="text-sub700" />
        </button>

        <div className="ml-2 flex-1">{button}</div>
      </div>

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={shareTitle}
        description={shareDescription}
        imageUrl={shareImageUrl}
      />
    </CommonBottomFixedBar>
  );
}
