type Props = {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function AlertModal({ message, confirmLabel = '확인', onConfirm }: Props) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div className="w-full max-w-80 bg-neutral-50/20 rounded-[20px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] p-5 flex flex-col gap-5">
        <p className="typo-body-md-regular text-main whitespace-pre-line">{message}</p>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-11 bg-dark rounded-full flex items-center justify-center text-card text-lg font-normal leading-6"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
