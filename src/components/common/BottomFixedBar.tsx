import { useRef } from 'react';

import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

type BottomFixedBarContainer = 'legacy' | 'form' | 'list';

interface BottomFixedBarProps {
  children: React.ReactNode;
  /**
   * 바 안쪽 콘텐츠 폭. PageContainer 의 variant 와 맞춘다.
   * - legacy(기본값): 기존 화면용. 바 자체가 max-w-md 로 가운데 고정된다
   * - form · list: 바 배경은 화면 전체 폭, 콘텐츠는 PageContainer 와 같은 폭 · 여백.
   *   바 높이만큼 자리를 차지하는 빈 요소를 함께 그려 본문 끝이 가리지 않는다
   */
  container?: BottomFixedBarContainer;
}

const CONTENT_WIDTH_CLASS: Record<Exclude<BottomFixedBarContainer, 'legacy'>, string> = {
  form: 'tablet:max-w-form',
  list: 'tablet:max-w-list',
};

export function BottomFixedBar({ children, container = 'legacy' }: BottomFixedBarProps) {
  const barRef = useRef<HTMLElement>(null);
  const barHeight = useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();
  const isLegacy = container === 'legacy';

  return (
    <>
      {!isLegacy && <div aria-hidden className="shrink-0" style={{ height: barHeight }} />}
      <footer
        ref={barRef}
        className={cn(
          'fixed bottom-keyboard-inset z-50 border-t border-line bg-card',
          isLegacy ? 'left-1/2 w-full max-w-md -translate-x-1/2' : 'inset-x-0',
        )}
      >
        <div
          className={cn(
            'pt-4',
            // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
            isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
            isLegacy ? 'px-5' : cn('mx-auto w-full px-gutter', CONTENT_WIDTH_CLASS[container]),
          )}
        >
          {children}
        </div>
      </footer>
    </>
  );
}
