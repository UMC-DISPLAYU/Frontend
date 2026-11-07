import { useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

interface BottomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** PageContainer 안에 둘 때 true. 좌우 여백은 PageContainer 의 px-gutter 를 그대로 쓴다 */
  inPageContainer?: boolean;
  /** 버튼을 감싸는 하단 영역의 class. 페이지 배경이 bg-page 가 아닐 때 배경을 맞춘다 */
  wrapperClassName?: string;
}

export function BottomButton({
  children,
  className,
  type = 'button',
  inPageContainer = false,
  wrapperClassName,
  ...props
}: BottomButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useBottomObstruction(wrapperRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  return (
    // sticky + bottom-keyboard-inset: 평소에는 제자리(화면 아래), iOS 에서 키보드가 열리면 키보드 위에 붙는다
    <div
      ref={wrapperRef}
      className={cn(
        'sticky bottom-keyboard-inset z-10 mt-auto shrink-0 bg-page',
        inPageContainer && 'pt-5',
        wrapperClassName,
      )}
    >
      <div
        className={cn(
          !inPageContainer && 'px-5',
          // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
          isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
        )}
      >
        <button
          type={type}
          className={cn(
            'h-11 w-full rounded-xl typo-body-sm-bold text-white transition-colors',
            props.disabled ? 'bg-bt-gray text-faint' : 'bg-bt-black',
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </div>
    </div>
  );
}
