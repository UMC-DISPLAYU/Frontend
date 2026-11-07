import { type ButtonHTMLAttributes, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 온보딩 하단 고정 버튼. 공용 BottomButton 은 감싸는 영역이 bg-page(회색)라 흰 배경 화면에 띠가 생겨,
 * 규칙에 있는 직접 만드는 하단 고정 요소 방식(fixed bottom-keyboard-inset + useBottomObstruction)으로 만든다.
 */
export function OnboardingBottomButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const barRef = useRef<HTMLDivElement>(null);
  const barHeight = useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    <>
      {/* 고정 바 높이만큼 자리를 차지해 본문 끝이 가리지 않게 한다 */}
      <div aria-hidden className="shrink-0" style={{ height: barHeight }} />
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-keyboard-inset z-10 mx-auto w-full bg-primary-white pt-5 tablet:max-w-form"
      >
        <div
          className={cn(
            'px-gutter',
            // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
            isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
          )}
        >
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
      </div>
    </>
  );
}
