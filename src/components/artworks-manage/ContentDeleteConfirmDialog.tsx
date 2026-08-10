import { useEffect, useRef } from 'react';

interface ContentDeleteConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContentDeleteConfirmDialog({
  onCancel,
  onConfirm,
}: ContentDeleteConfirmDialogProps) {
  const titleId = 'content-delete-confirm-title';
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButtonRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-main/35 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="w-80 rounded-[20px] bg-card/50 p-6 backdrop-blur-[10px]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="typo-body-xl-bold text-center text-main">
          콘텐츠를 삭제할까요?
        </h2>
        <p className="typo-body-md-regular mt-2 text-center text-sub600">
          삭제한 콘텐츠는 전시에서 제거되며,
          <br />
          복구할 수 없어요.
        </p>
        <div className="mt-6 flex gap-2.5">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="typo-body-xl-regular h-11 flex-1 rounded-full bg-bt-gray text-main"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="typo-body-xl-regular h-11 flex-1 rounded-full bg-faint text-main"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
