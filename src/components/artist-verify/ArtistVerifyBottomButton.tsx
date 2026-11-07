import { type ButtonHTMLAttributes, type ReactNode, useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

/**
 * 공용 BottomButton 은 legacy 배경(bg-page)과 버튼 색이라 피그마와 맞지 않아 따로 둔다.
 * 동작(sticky + 키보드 위 고정 + 하단 가림 등록)은 BottomButton 과 같다.
 */
export function ArtistVerifyBottomBar({ children }: { children: ReactNode }) {
  const barRef = useRef<HTMLDivElement>(null);
  useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    <div
      className={cn(
        'sticky bottom-keyboard-inset z-10 mt-auto flex shrink-0 flex-col gap-2 bg-primary-white pt-3',
        // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
        isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
      )}
      ref={barRef}
    >
      {children}
    </div>
  );
}

type ArtistVerifyBottomButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function ArtistVerifyBottomButton({
  type = 'button',
  variant = 'primary',
  className,
  ...props
}: ArtistVerifyBottomButtonProps) {
  return (
    <button
      className={cn(
        'h-11 w-full cursor-pointer rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100',
        variant === 'primary'
          ? 'typography-body-lg-semibold bg-interactive-primary text-interactive-inverse hover:bg-interactive-primary-hover active:bg-interactive-primary-press'
          : 'typography-body-lg-bold bg-secondary text-primary',
        className,
      )}
      type={type}
      {...props}
    />
  );
}
