interface CardPopoverProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardPopover({ canEdit, canDelete, onEdit, onDelete }: CardPopoverProps) {
  return (
    <div
      role="menu"
      className="w-36 overflow-hidden rounded-2xl bg-card shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)] outline-1 -outline-offset-1 outline-line"
    >
      {canEdit && (
        <button
          type="button"
          role="menuitem"
          onClick={onEdit}
          className="typo-body-xs-regular flex h-10 w-full items-center px-3.5 text-left text-main"
        >
          콘텐츠 수정
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          role="menuitem"
          onClick={onDelete}
          className="typo-body-xs-regular flex h-10 w-full items-center border-t border-line-soft px-3.5 text-left text-error"
        >
          삭제하기
        </button>
      )}
    </div>
  );
}
