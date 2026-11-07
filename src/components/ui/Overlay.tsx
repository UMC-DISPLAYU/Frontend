import { type ReactNode, type RefObject, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { usePresence } from '@/hooks/usePresence';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';

export interface OverlayProps {
  open: boolean;
  /** 배경 탭 · ESC · 뒤로가기 · 닫기 버튼으로 닫힐 때 불린다. 부모가 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 화면에 보이는 제목. aria-labelledby 로 연결된다 */
  title: ReactNode;
  /** 제목 아래 설명. aria-describedby 로 연결된다 */
  description?: ReactNode;
  /** 본문. 길면 이 영역만 스크롤된다 */
  children?: ReactNode;
  /** 본문 아래 고정 영역(버튼 등). 스크롤되지 않는다 */
  footer?: ReactNode;
  /** 가운데 모달 폭. sm 320px(확인 · 안내), md 480px(입력 · 목록) */
  size?: 'sm' | 'md';
  /** modal 은 모바일에서도 중앙 모달로 표시한다. 기본은 모바일 시트 · 태블릿 이상 모달 */
  presentation?: 'responsive' | 'modal';
  showCloseButton?: boolean;
  /** 열릴 때 먼저 포커스할 요소. 없으면 패널에 포커스한다(입력창 자동 포커스는 모바일 키보드를 띄운다) */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 확인 · 경고처럼 응답이 필요한 경우 alertdialog */
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

/**
 * 기본은 768px 미만 바텀시트, 이상 가운데 모달. presentation="modal"로 중앙 표시를 고정한다.
 * 열려 있는 동안 뒤 페이지 스크롤을 잠그고, 배경 탭 · ESC · 뒤로가기로 닫힌다.
 */
export function Overlay({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  presentation = 'responsive',
  showCloseButton = true,
  initialFocusRef,
  role = 'dialog',
  className,
}: OverlayProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const isModal = presentation === 'modal';

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

  // 목록 등장 애니메이션(transform)이 걸린 조상 안에서도 화면 기준으로 고정되도록 body 에 그린다
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-70 flex flex-col pt-safe-area-top pb-keyboard-inset',
        isExiting && 'pointer-events-none',
      )}
    >
      {/* 배경 탭으로 닫기. 키보드 · 스크린리더 사용자는 ESC 와 닫기 버튼을 쓴다 */}
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={cn(
          'absolute inset-0 touch-none bg-dim',
          isExiting ? 'animate-fade-out' : 'animate-fade-in',
        )}
      />
      <div
        className={cn(
          'pointer-events-none relative flex min-h-0 flex-1 flex-col',
          isModal
            ? 'items-center justify-center p-gutter'
            : 'justify-end pt-10 tablet:items-center tablet:justify-center tablet:p-gutter',
        )}
      >
        <section
          ref={panelRef}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          onAnimationEnd={onAnimationEnd}
          className={cn(
            'pointer-events-auto flex max-h-full min-h-0 w-full flex-col bg-primary-white text-primary outline-none',
            isModal
              ? 'rounded-20 pb-5 shadow-lg'
              : 'rounded-t-20 pb-safe-area-bottom tablet:rounded-20 tablet:pb-5 tablet:shadow-lg',
            isModal
              ? size === 'sm'
                ? 'max-w-80'
                : 'max-w-120'
              : size === 'sm'
                ? 'tablet:max-w-80'
                : 'tablet:max-w-120',
            isModal
              ? isExiting
                ? 'animate-modal-out'
                : 'animate-modal-in'
              : isExiting
                ? 'animate-sheet-out tablet:animate-modal-out'
                : 'animate-sheet-in tablet:animate-modal-in',
            className,
          )}
        >
          {!isModal && (
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-circle bg-tertiary tablet:hidden"
            />
          )}
          <div
            className={cn('flex shrink-0 items-start gap-2 px-5 pt-5', !isModal && 'tablet:pt-6')}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h2 id={titleId} className="typography-title-xs break-keep text-primary">
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className="typography-body-lg-medium break-keep whitespace-pre-line text-secondary"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                aria-label="닫기"
                onClick={requestClose}
                className="-mt-2.5 -mr-3 flex size-11 shrink-0 items-center justify-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
              >
                <X aria-hidden="true" className="size-6" strokeWidth={1.5} />
              </button>
            )}
          </div>
          {children && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4">
              {children}
            </div>
          )}
          {footer && <div className="shrink-0 px-5 pt-5">{footer}</div>}
        </section>
      </div>
    </div>,
    document.body,
  );
}
