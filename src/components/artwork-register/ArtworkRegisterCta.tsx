import { type ReactNode, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 작품 등록 · 완료 화면의 하단 버튼 영역. 프로토타입처럼 본문 폭 안에서 화면 아래에 sticky 로 붙고,
 * 위쪽이 흰색으로 흐려져 스크롤된 본문이 버튼 뒤로 자연스럽게 사라진다.
 */
export function ArtworkRegisterCta({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useBottomObstruction(ref);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    // bottom-keyboard-inset: iOS 에서 키보드가 열리면 키보드 위에 붙는다
    <div
      ref={ref}
      className={cn(
        'sticky bottom-keyboard-inset z-10 mt-auto bg-linear-to-b from-transparent to-(--semantic-color-bg-primary-white) to-28% pt-3',
        // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
        isKeyboardOpen ? 'pb-3' : 'pb-safe-area-bottom',
      )}
    >
      {children}
    </div>
  );
}
