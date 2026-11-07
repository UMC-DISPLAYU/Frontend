import { Check } from 'lucide-react';

import { InfoNotice } from './InfoNotice';
import { OnboardingBottomButton } from './OnboardingBottomButton';

export function SignupCompleteScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center gap-2.5">
        <div className="flex size-19 items-center justify-center rounded-full bg-box">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#0d0d0d]">
            <Check className="size-6 text-[#ffffff]" strokeWidth={2.6} />
          </div>
        </div>
        <h1 className="text-[20px] leading-[1.4] font-bold tracking-[-0.03em] text-main">
          가입이 완료되었어요
        </h1>
      </main>

      <div className="shrink-0 pb-3">
        <InfoNotice>전시 등록과 작품 등록은 대학생 인증 후 이용할 수 있어요.</InfoNotice>
      </div>

      <OnboardingBottomButton onClick={onNext}>이용하기</OnboardingBottomButton>
    </>
  );
}
