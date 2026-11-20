import type { ReactNode } from 'react';

import { FitImage } from '@/components/common/FitImage';
import type { Work } from '@/types/artworkManage';
import { ARTWORK_FIT_RULE } from '@/utils/imageFit';

/*
 * 프로토타입 works.html `.wc`: 3:4 사진(모서리 없음) · 사진 아래 8 제목 14 SemiBold · 작가 12 Medium.
 * 작가는 대표 · 공동 작가를 ", "로 잇는다(2차 피드백).
 * 사진 위 버튼 · 칩은 overlay 로 받는다(관리: … 메뉴 · 내 작품, 순서 편집: 번호 · 손잡이)
 */
export function WorkCard({
  work,
  isMine = false,
  overlay,
}: {
  work: Work;
  isMine?: boolean;
  overlay?: ReactNode;
}) {
  return (
    <div className="relative text-[#18181b]">
      <div className="relative aspect-3/4 overflow-hidden bg-[#f4f4f5]">
        <FitImage
          src={work.thumbnail}
          alt={work.title}
          displayWidth={260}
          crop={work.thumbnailCrop}
          fit={work.hasVideo ? 'FILL' : work.thumbnailFit}
          rule={ARTWORK_FIT_RULE}
          fitClassName="bg-primary-white"
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
      <p className="truncate text-[12px] font-medium text-[#3f3f47]">
        {(work.artistNames ?? [work.artist]).filter(Boolean).join(', ')}
      </p>
    </div>
  );
}
