import { type RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0,
  );

interface FocusTrapOptions {
  /** 열릴 때 먼저 포커스할 요소. 없으면 컨테이너 자체(tabIndex={-1})에 포커스한다 */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 겹쳐 열린 경우 맨 위에서만 Tab 을 가둔다 */
  isTopmost?: () => boolean;
}

/**
 * active 인 동안 포커스를 컨테이너 안에 가두고, 끝나면 열기 전 요소로 돌려준다.
 * 입력창에 바로 포커스하면 모바일에서 키보드가 갑자기 올라오므로 기본값은 컨테이너다.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocusRef, isTopmost }: FocusTrapOptions = {},
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (initialFocusRef?.current ?? container).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || (isTopmost && !isTopmost())) return;

      const focusable = getFocusableElements(container);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const isOutside = !(current instanceof Node) || !container.contains(current);

      if (event.shiftKey && (isOutside || current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (isOutside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, containerRef, initialFocusRef, isTopmost]);
}
