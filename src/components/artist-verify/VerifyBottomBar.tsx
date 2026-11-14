import { type ButtonHTMLAttributes, type ReactNode, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

import { FOCUS_RING, PRESS_TRANSITION, TAP_BASE } from './artistVerifyStyles';

/**
 * 프로토타입 하단 버튼 영역(.cta): 위 20px, 아래 max(16px, safe area), 위쪽이 투명한 흰색 그라데이션.
 * 공용 BottomButton 과 같은 동작(sticky + 키보드 위 고정 + 하단 가림 등록)을 한다.
 */
export function VerifyBottomBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    <div
      className={cn(
        'sticky bottom-keyboard-inset z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_28%)] pt-5',
        // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
        isKeyboardOpen ? 'pb-4' : 'pb-[max(16px,env(safe-area-inset-bottom))]',
        className,
      )}
      ref={barRef}
    >
      {children}
    </div>
  );
}

type VerifyBottomButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function VerifyBottomButton({
  type = 'button',
  variant = 'primary',
  className,
  ...props
}: VerifyBottomButtonProps) {
  return (
    <button
      className={cn(
        TAP_BASE,
        FOCUS_RING,
        PRESS_TRANSITION,
        'h-12 w-full rounded-[12px] text-[16px] font-semibold active:enabled:scale-[.99] disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8]',
        variant === 'primary'
          ? 'bg-[#18181b] text-[#fff] hover:enabled:bg-[#2f2f35]'
          : 'bg-[#f0f0f3] text-[#18181b]',
        className,
      )}
      type={type}
      {...props}
    />
  );
}
