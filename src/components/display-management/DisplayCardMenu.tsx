import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

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

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = [...event.currentTarget.querySelectorAll('button')];
    const current = items.findIndex((item) => item === document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : items.length - 1;
    items[(current + step) % items.length]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-2 right-1.5 z-2"
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-full text-[#18181b] transition-colors duration-200 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5.5 fill-current">
          <circle cx="5.5" cy="12" r="1.3" />
          <circle cx="12" cy="12" r="1.3" />
          <circle cx="18.5" cy="12" r="1.3" />
        </svg>
      </button>
      {open && (
        // 프로토타입은 메뉴를 카드 기준 위 44px · 오른쪽 10px 에 둔다. 버튼 틀(위 8 · 오른쪽 6) 기준으로 옮긴 값이다
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          onKeyDown={handleMenuKeyDown}
          aria-label={`${displayTitle} 메뉴`}
          className="absolute top-9 right-1 z-30 w-41 rounded-[12px] border border-[#d4d4d8] bg-[#fff] py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-[opacity,translate] duration-200 ease-standard starting:-translate-y-1 starting:opacity-0"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={cn(
                'block h-11 w-full px-4 text-left text-[14px] leading-[1.4] font-medium tracking-[-0.03em] transition-colors duration-150 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                action.destructive ? 'text-[#fb2c36]' : 'text-[#18181b]',
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
