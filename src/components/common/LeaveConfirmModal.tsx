import { useEffect, useId, useRef } from 'react';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function LeaveConfirmModal({ onConfirm, onCancel }: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="전시 나가기"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div className="relative w-80 h-48 -translate-y-30 bg-neutral-50/20 rounded-[20px] shadow-[inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] overflow-hidden">
        <div className="w-72 absolute left-6 top-6 flex flex-col justify-start items-start gap-2">
          <h3 className="w-72 text-center typo-body-xl-bold text-modal-title">전시를 나갈까요?</h3>
          <p id={descriptionId} className="w-72 text-center typo-body-md-regular text-modal-desc">
            전시에서 나갈 수 있어요.
            <br />
            정말 나가시겠어요?
          </p>
        </div>

        <div className="absolute left-5 top-[126px] flex justify-start items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-32 h-11 bg-modal-btn-hover-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-hover-fg">나가기</span>
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="w-32 h-11 bg-modal-btn-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-fg">취소</span>
          </button>
        </div>
      </div>
    </div>
  );
}
