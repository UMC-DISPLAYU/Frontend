import { useEffect, useRef } from 'react';

interface ExhibitionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  position: { top: number; right: number };
}

export function ExhibitionMenu({ onEdit, onDelete, onClose, position }: ExhibitionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="w-36 h-20 absolute bg-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-input-soft-border overflow-hidden z-50"
      style={{ top: position.top, right: position.right }}
    >
      <button
        onClick={onEdit}
        className="w-36 h-10 absolute left-[1px] top-[1px] border-none bg-transparent cursor-pointer"
      >
        <div className="absolute left-[14px] top-[12px] typo-body-xs-regular text-main">
          전시 작가명 수정
        </div>
      </button>
      <button
        onClick={onDelete}
        className="w-36 h-10 absolute left-[1px] top-[41px] border-t border-line-soft bg-transparent cursor-pointer"
      >
        <div className="absolute left-[14px] top-[12px] typo-body-xs-regular text-error">
          삭제하기
        </div>
      </button>
    </div>
  );
}
