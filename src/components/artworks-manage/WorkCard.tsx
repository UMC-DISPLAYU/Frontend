import type { ReactNode } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { Work } from '@/types/artworkManage';
import { cn } from '@/utils/cn';

/*
 * 프로토타입 works.html `.wc`: 3:4 사진(모서리 없음) · 사진 아래 8 제목 14 SemiBold · 작가 12 Medium.
 * 사진 위 버튼 · 칩은 overlay 로 받는다(관리: … 메뉴 · 내 작품, 순서 편집: 번호 · 손잡이)
 */
export function WorkCard({
  work,
  isMine = false,
  overlay,
  className,
}: {
  work: Work;
  isMine?: boolean;
  overlay?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative text-[#18181b]', className)}>
      <div className="relative aspect-3/4 overflow-hidden bg-[#f4f4f5]">
        <OptimizedImage
          src={work.thumbnail}
          alt={work.title}
          displayWidth={260}
          skeleton
          draggable={false}
          frameClassName="h-full w-full"
          className="object-cover select-none"
        />
        {isMine && (
          <span className="absolute bottom-2 left-2 inline-flex h-6 items-center rounded-circle bg-[rgba(0,0,0,.5)] px-2.5 text-[12px] font-semibold text-[#fff] backdrop-blur-[6px]">
            내 작품
          </span>
        )}
        {overlay}
      </div>
      <p className="mt-2 truncate text-[14px] font-semibold">{work.title}</p>
      <p className="truncate text-[12px] font-medium text-[#3f3f47]">{work.artist}</p>
    </div>
  );
}
