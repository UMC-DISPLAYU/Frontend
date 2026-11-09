import { useEffect, useId, useRef, useState } from 'react';

import MoreIcon from '@/assets/display-management/MoreIcon.svg';
import { cn } from '@/utils/cn';

export interface DisplayCardAction {
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

export function DisplayCardMenu({
  displayTitle,
  actions,
}: {
  displayTitle: string;
  actions: DisplayCardAction[];
}) {
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
      className="absolute -top-px right-0"
      onBlur={(event) => {
        // Safari 는 버튼을 눌러도 포커스를 주지 않아 relatedTarget 이 비어 있다. 이때 닫으면 메뉴 클릭이 사라진다
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${displayTitle} 메뉴`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className="flex size-11 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
      >
        <img src={MoreIcon} alt="" />
      </button>
      {open && (
        <div
          id={menuId}
          aria-label={`${displayTitle} 메뉴`}
          className="absolute top-11 right-2.75 w-36 rounded-12 border border-primary bg-primary-white shadow-card"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              // 디자인 높이는 40px 이라 터치 영역(44px)은 메뉴 바깥쪽으로 after 를 넓혀 맞춘다
              className={cn(
                'typography-body-md-medium relative block h-10 w-full px-3.5 text-left transition duration-fast ease-standard after:absolute after:inset-0 first:rounded-t-12 first:after:-top-1 last:rounded-b-12 last:after:-bottom-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                action.destructive
                  ? 'text-error hover:bg-error-subtle'
                  : 'text-primary hover:bg-secondary',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
