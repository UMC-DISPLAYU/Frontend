import { useEffect, useId, useRef, useState } from 'react';

import MoreIcon from '@/assets/exhibition-work/MoreIcon.svg';
import type { Work } from '@/types/artworkManage';

interface WorkActionSheetProps {
  work: Work;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkActionSheet({
  work,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: WorkActionSheetProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="absolute top-1.5 right-1.5"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${work.title} 작품 관리`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className="flex size-11 items-center justify-center rounded-circle transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-99"
      >
        <img src={MoreIcon} alt="" />
      </button>
      {open && (
        <div
          id={menuId}
          aria-label="작품 관리"
          className="absolute right-0 z-20 w-36 rounded-12 border border-primary bg-primary-white p-1 shadow-lg"
        >
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="typography-body-md-medium min-h-11 w-full rounded-8 px-3 text-left text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              수정하기
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="typography-body-md-medium min-h-11 w-full rounded-8 px-3 text-left text-error transition duration-fast ease-standard hover:bg-error-subtle focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              삭제하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
