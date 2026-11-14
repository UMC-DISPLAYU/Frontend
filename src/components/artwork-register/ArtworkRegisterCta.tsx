import { type ReactNode, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 작품 등록 · 완료 화면의 하단 버튼 영역. 프로토타입처럼 본문 폭 안에서 화면 아래에 sticky 로 붙고,
 * 위쪽이 흰색으로 흐려져 스크롤된 본문이 버튼 뒤로 자연스럽게 사라진다.
 */
export function ArtworkRegisterCta({
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
        'sticky bottom-keyboard-inset z-5 mt-auto bg-linear-to-b from-[rgba(255,255,255,0)] to-[#fff] to-28% pt-5',
        // 프로토타입: 아래 여백은 홈 인디케이터 영역과 16px 중 큰 값. 키보드가 열리면 16px 만 둔다
        isKeyboardOpen ? 'pb-4' : 'pb-[max(16px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  );
}
