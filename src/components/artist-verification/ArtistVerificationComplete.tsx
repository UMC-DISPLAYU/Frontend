import { Check } from 'lucide-react';

import { ArtistVerificationBottomButton } from './ArtistVerificationBottomButton';

interface ArtistVerificationCompleteProps {
  onDone: () => void;
}

export function ArtistVerificationComplete({ onDone }: ArtistVerificationCompleteProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page">
      <main className="flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-page px-5">
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center pb-14 text-center">
          <div className="mx-auto flex size-[76px] items-center justify-center rounded-full bg-box">
            <div className="flex size-12 items-center justify-center rounded-full bg-bt-black">
              <Check className="size-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="mt-[10px] typo-body-xl-bold text-main">작가인증이 완료되었어요</h1>
          <p className="mt-1 typo-body-xs-regular text-faint">
            전시 등록, 전시작 등록, 작가 프로필 관리가 가능해요!
          </p>
        </section>

        <ArtistVerificationBottomButton onClick={onDone}>인증 완료</ArtistVerificationBottomButton>
      </main>
    </div>
  );
}
