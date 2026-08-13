import { useEffect, useState } from 'react';

import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  keyboardAvoiding?: boolean;
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  keyboardAvoiding = false,
  children,
}: BottomSheetProps) {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !keyboardAvoiding || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const updateKeyboardOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(offset);
    };

    const frame = requestAnimationFrame(updateKeyboardOffset);
    viewport.addEventListener('resize', updateKeyboardOffset);
    viewport.addEventListener('scroll', updateKeyboardOffset);

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', updateKeyboardOffset);
      viewport.removeEventListener('scroll', updateKeyboardOffset);
    };
  }, [open, keyboardAvoiding]);

  const offset = open && keyboardAvoiding ? keyboardOffset : 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-page pb-safe-bottom"
        style={{
          transform: offset ? `translateY(-${offset}px)` : undefined,
          transition: 'transform 180ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pb-2 pt-6">
          <div className="flex flex-col gap-1">
            <h2 className="typo-body-xl-bold tracking-wide text-main">{title}</h2>
            {subtitle && <p className="typo-body-xs-regular text-faint">{subtitle}</p>}
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="-mr-1 p-1">
            <X className="size-6 text-main" strokeWidth={1.5} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
