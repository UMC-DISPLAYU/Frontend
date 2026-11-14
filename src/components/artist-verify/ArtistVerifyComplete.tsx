import { useEffect, useRef } from 'react';

import { CheckIcon } from './ArtistVerifyIcons';
import { ArtistVerifyLayout } from './ArtistVerifyLayout';
import { VerifyBottomBar, VerifyBottomButton } from './VerifyBottomBar';

type ArtistVerifyCompleteProps = {
  onGoProfile: () => void;
  onDone: () => void;
};

export function ArtistVerifyComplete({ onGoProfile, onDone }: ArtistVerifyCompleteProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 같은 주소에서 입력 화면이 완료 화면으로 바뀌므로 맨 위로 올리고 제목을 읽어준다
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <ArtistVerifyLayout>
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
          {/* 검정 원이 커지며 나타나고, 뒤로 옅은 원이 퍼진 뒤 체크가 그려진다 */}
          <div
            aria-hidden="true"
            className="relative isolate grid size-16 animate-[artist-verify-ring_.6s_cubic-bezier(.16,1,.3,1)_both] place-items-center rounded-full bg-[#18181b] text-[#fff] before:absolute before:inset-0 before:-z-10 before:animate-[artist-verify-halo_.9s_.18s_cubic-bezier(.16,1,.3,1)_both] before:rounded-[inherit] before:bg-[#18181b] before:opacity-0 before:content-['']"
          >
            <CheckIcon
              className="size-7 animate-[artist-verify-draw_.45s_.3s_cubic-bezier(.16,1,.3,1)_backwards] [stroke-dasharray:26] [stroke-dashoffset:0]"
              strokeWidth={2.4}
            />
          </div>
          <h1
            className="mt-6 animate-[artist-verify-up_.5s_.3s_cubic-bezier(.16,1,.3,1)_both] text-[20px] font-bold outline-none"
            ref={titleRef}
            tabIndex={-1}
          >
            작가 인증이 완료되었어요
          </h1>
          <p className="mt-2 animate-[artist-verify-up_.5s_.36s_cubic-bezier(.16,1,.3,1)_both] text-[14px] font-normal text-[#71717b]">
            전시 등록, 전시작 등록, 작가 프로필 관리가 가능해요!
          </p>
        </div>

        <VerifyBottomBar className="grid gap-2">
          <VerifyBottomButton onClick={onGoProfile}>작가 프로필 가기</VerifyBottomButton>
          <VerifyBottomButton onClick={onDone} variant="secondary">
            확인
          </VerifyBottomButton>
        </VerifyBottomBar>
      </main>
    </ArtistVerifyLayout>
  );
}
