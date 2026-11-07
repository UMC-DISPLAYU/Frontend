import { createPortal } from 'react-dom';

import { removeToast, useToastStore } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

interface ToasterProps {
  /** 하단 냅바가 보이는 화면이면 true. 토스트를 냅바 위로 올린다 */
  hasNavbar: boolean;
}

/** toast() 로 띄운 토스트를 그린다. 앱에 한 번만 둔다(Layout) */
export function Toaster({ hasNavbar }: ToasterProps) {
  const current = useToastStore((state) => state.toast);

  // 알림 영역(aria-live)은 문구가 바뀌기 전부터 있어야 스크린리더가 읽으므로 항상 그려 둔다
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-keyboard-inset z-80"
    >
      <div
        className={cn(
          'flex justify-center px-gutter',
          hasNavbar ? 'pb-navbar-clearance' : 'pb-safe-area-bottom',
        )}
      >
        {current && (
          <p
            key={current.id}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && current.isClosing) {
                removeToast(current.id);
              }
            }}
            className={cn(
              'mb-3 w-max max-w-110 rounded-8 bg-primary-black px-4.5 py-3.5 typography-body-lg-medium break-keep text-interactive-inverse',
              current.isClosing ? 'animate-toast-out' : 'animate-toast-in',
            )}
          >
            {current.message}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
