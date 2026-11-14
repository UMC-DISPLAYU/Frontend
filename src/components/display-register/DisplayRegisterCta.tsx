import { type ReactNode, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 프로토타입 .cta — 본문 흐름 끝에서 화면 아래에 sticky 로 붙고, 위쪽이 흰색으로 흐려져
 * 스크롤된 본문이 버튼 뒤로 사라진다. 아래 여백은 홈 인디케이터 영역과 16px 중 큰 값.
 */
export function DisplayRegisterCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useBottomObstruction(ref);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    // bottom-keyboard-inset: iOS 에서 키보드가 열리면 키보드 위에 붙는다
    <div
      ref={ref}
      className={cn(
        'sticky bottom-keyboard-inset z-5 bg-linear-to-b from-[rgba(255,255,255,0)] to-[#fff] to-28% pt-5',
        isKeyboardOpen ? 'pb-4' : 'pb-[max(16px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  );
}
