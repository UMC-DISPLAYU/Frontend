import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export function OnboardingBottomButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    /* 홈 인디케이터가 있는 기기에서 버튼이 가려지지 않게 safe-area 만큼 띄운다 */
    <div className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type={type}
        className={cn(
          'h-11 w-full rounded-xl bg-bt-black text-[14px] leading-[1.4] font-bold tracking-[-0.03em] text-white',
          /* 비활성 상태는 피그마에 없어 공용 BottomButton과 같은 값을 쓴다 */
          'disabled:bg-bt-gray disabled:text-faint',
          className,
        )}
        {...props}
      />
    </div>
  );
}
