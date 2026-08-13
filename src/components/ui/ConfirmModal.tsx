import { useEffect, useId, useRef } from 'react';

type Props = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  layout?: 'horizontal' | 'vertical';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  layout = 'horizontal',
  onConfirm,
  onCancel,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isVertical = layout === 'vertical';
  const buttonSizeClass = isVertical ? 'w-[282px] flex-none self-center' : 'flex-1';

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="확인"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div
        className={`flex w-full max-w-80 flex-col overflow-hidden rounded-[20px] bg-neutral-50/70 p-5 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] ${isVertical ? 'gap-7' : 'gap-5'}`}
      >
        <div className={`flex flex-col gap-2 ${isVertical ? 'text-center' : 'text-left'}`}>
          {title && <h2 className="typo-body-xl-bold text-main">{title}</h2>}
          <p
            id={descriptionId}
            className={`typo-body-md-regular whitespace-pre-line ${isVertical ? 'text-sub600' : 'text-main'}`}
          >
            {message}
          </p>
        </div>
        <div className={isVertical ? 'flex flex-col gap-2.5' : 'flex gap-2.5'}>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex h-11 items-center justify-center rounded-full bg-dark text-card typo-body-md-bold ${buttonSizeClass}`}
          >
            {confirmLabel}
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className={`flex h-11 items-center justify-center rounded-full bg-bt-gray text-main typo-body-md-regular ${buttonSizeClass}`}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
