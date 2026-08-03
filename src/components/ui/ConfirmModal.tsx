import { useEffect, useId, useRef } from 'react';

type Props = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="확인"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div className="w-full max-w-80 bg-neutral-50/20 rounded-[20px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] p-5 flex flex-col gap-5">
        <p id={descriptionId} className="typo-body-md-regular text-main whitespace-pre-line">
          {message}
        </p>
        <div className="flex gap-2.5">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 bg-bt-gray rounded-full flex items-center justify-center text-main typo-body-md-regular"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-11 bg-dark rounded-full flex items-center justify-center text-card typo-body-md-regular"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
