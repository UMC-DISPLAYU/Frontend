import { type CSSProperties, type ReactNode, useRef, useSyncExternalStore } from 'react';

import { useBottomObstruction } from '@/hooks/useVirtualKeyboard';
import { cn } from '@/utils/cn';

const DESKTOP_QUERY = '(min-width: 900px)';

const subscribeDesktop = (onChange: () => void) => {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const getIsDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

interface DisplayHubBottomBarProps {
  children: ReactNode;
  /** 노트북(900~)에서 화면 아래에 붙지 않고 본문 안에 놓이면 true. 이때는 토스트 위치 계산에서 뺀다 */
  staticOnDesktop?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * 프로토타입 flow.css `.cta`: 화면 아래에 붙고, 위쪽은 흰색으로 서서히 덮는 하단 버튼 영역.
 * 토스트가 버튼을 가리지 않도록 하단 고정 요소로 등록한다.
 */
export function DisplayHubBottomBar({
  children,
  staticOnDesktop = false,
  className,
  style,
}: DisplayHubBottomBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getIsDesktop, () => false);
  useBottomObstruction(barRef, !(staticOnDesktop && isDesktop));

  return (
    <div
      ref={barRef}
      style={style}
      className={cn(
        'sticky bottom-0 z-5 mt-auto bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_28%)] pt-5 pb-safe-area-bottom',
        className,
      )}
    >
      {children}
    </div>
  );
}
