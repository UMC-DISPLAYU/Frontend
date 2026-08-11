import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

type Props = {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ImageModal({ imageUrl, isOpen, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Request animation frame ensures the modal is rendered before focusing
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="확대된 이미지"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <button
        type="button"
        ref={closeButtonRef}
        aria-label="이미지 닫기"
        className="absolute top-4 right-4 p-2 text-white"
        onClick={onClose}
      >
        <X className="size-8" />
      </button>
      <img
        src={imageUrl}
        alt="확대된 이미지"
        className="max-h-[90vh] max-w-[90vw] object-contain cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
