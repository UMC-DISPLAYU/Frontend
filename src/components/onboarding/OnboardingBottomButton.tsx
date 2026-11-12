import { type ButtonHTMLAttributes, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 온보딩 하단 버튼(프로토타입 `.cta` · `.big`). 본문 흐름 안에서 화면 아래에 붙고, 위쪽은 흰색으로 흐려진다.
 * 공용 BottomButton 은 감싸는 영역이 bg-page(회색)라 쓰지 않고, 규칙의 직접 만드는 하단 고정 요소 방식을 따른다.
 */
export function OnboardingBottomButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const barRef = useRef<HTMLDivElement>(null);
  useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    <div
      ref={barRef}
      className={cn(
        'sticky bottom-keyboard-inset z-10 mt-auto shrink-0 bg-linear-to-b from-primary-white/0 to-primary-white to-28% pt-5',
        // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
        isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
      )}
    >
      <button
        type={type}
        className={cn(
          'typography-body-xl-semibold grid h-12 w-full cursor-pointer place-items-center rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 active:bg-interactive-primary-press',
          'disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100',
          className,
        )}
        {...props}
      />
    </div>
  );
}
