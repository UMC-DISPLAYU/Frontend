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

const MENU_ITEM =
  'block h-10 w-full rounded-8 px-3 text-left text-[14px] font-medium transition-colors duration-fast hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]';

/*
 * … 버튼은 Figma `Card / 작품`(2081:32999) 기준: 32 · 검정 40% 원 · 사진 오른쪽 위 8.
 * 메뉴는 프로토타입 `.pop`: 버튼 아래(위 40) · 최소 폭 148 · 안쪽 8 · 항목 높이 40
 */
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('button')?.focus();
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
      className="absolute top-2 right-2 z-10"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${work.title} 작품 관리`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className="relative grid size-8 place-items-center rounded-circle before:absolute before:-inset-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff] active:scale-94"
      >
        <img src={MoreIcon} alt="" className="size-8" />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="작품 관리"
          className="absolute top-8 right-0 min-w-37 animate-modal-in [animation-duration:200ms] rounded-12 border border-[#f0f0f3] bg-[#fff] p-2 text-[#18181b] shadow-[0_5px_30px_rgba(0,0,0,.14)]"
        >
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className={MENU_ITEM}
            >
              수정하기
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className={`${MENU_ITEM} text-[#fb2c36]`}
            >
              삭제하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
