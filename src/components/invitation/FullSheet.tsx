import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { usePresence } from '@/hooks/usePresence';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';

interface FullSheetProps {
  open: boolean;
  /** 배경 탭 · ESC · 뒤로가기 · requestClose 로 닫힐 때 불린다. 부모가 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 스크린리더가 읽는 시트 이름 */
  label: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** requestClose 는 화면 안 닫기 버튼에 붙인다(오버레이 기록을 되돌리며 닫는다) */
  children: (requestClose: () => void) => ReactNode;
}

/**
 * 프로토타입 마이의 전체 화면 시트(받은 초대 · 참여 완료).
 * 768px 미만은 화면 전체를, 이상은 가운데 480px 패널을 쓴다.
 * 공용 Overlay 는 모바일에서 바텀시트라 이 모양이 안 나와서, 같은 오버레이 훅으로 따로 그린다.
 */
export function FullSheet({ open, onClose, label, initialFocusRef, children }: FullSheetProps) {
  const panelRef = useRef<HTMLElement>(null);

  const { isMounted, isExiting, onAnimationEnd } = usePresence(open);
  const { requestClose, isTopmost } = useOverlayHistory(open, onClose);

  useScrollLock(open);
  useFocusTrap(panelRef, open, { initialFocusRef, isTopmost });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // 한글 조합 중 ESC 는 조합 취소이므로 닫지 않는다
      if (event.key !== 'Escape' || event.isComposing || !isTopmost()) return;
      event.preventDefault();
      requestClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, isTopmost, requestClose]);

  if (!isMounted) return null;

  return createPortal(
    <div className={cn('fixed inset-0 z-70', isExiting && 'pointer-events-none')}>
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 touch-none bg-dim',
          isExiting ? 'animate-fade-out' : 'animate-fade-in',
        )}
        onClick={requestClose}
      />
      <section
        aria-label={label}
        aria-modal="true"
        className={cn(
          'absolute inset-0 flex flex-col overflow-hidden bg-primary-white pt-[env(safe-area-inset-top)] text-primary outline-none',
          'tablet:inset-y-[5vh] tablet:right-auto tablet:left-1/2 tablet:-ml-60 tablet:w-120 tablet:rounded-20 tablet:pt-0',
          isExiting ? 'animate-panel-out' : 'animate-panel-in',
        )}
        onAnimationEnd={onAnimationEnd}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        {children(requestClose)}
      </section>
    </div>,
    document.body,
  );
}
