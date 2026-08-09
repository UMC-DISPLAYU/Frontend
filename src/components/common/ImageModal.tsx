import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

type Props = {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ImageModal({ imageUrl, isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <button type="button" className="absolute top-4 right-4 p-2 text-white" onClick={onClose}>
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
