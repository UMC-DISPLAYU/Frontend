import { useEffect, useId, useRef } from 'react';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutConfirmModal({ onConfirm, onCancel }: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="로그아웃"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div className="relative w-80.5 h-48 -translate-y-30 bg-neutral-50/40 rounded-[20px] shadow-[inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] overflow-hidden">
        <div className="absolute inset-x-6 top-6 flex flex-col items-center gap-2">
          <h3 className="w-full text-center typo-body-xl-bold text-modal-title">
            로그아웃 할까요?
          </h3>
          <p id={descriptionId} className="w-full text-center typo-body-md-regular text-modal-desc">
            로그아웃 후에도 저장한 전시와 기록은
            <br />
            계정에 유지돼요.
          </p>
        </div>

        <div className="absolute left-5 right-5 top-[126px] flex items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-11 bg-modal-btn-hover-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-hover-fg">확인</span>
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 bg-modal-btn-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-fg">취소</span>
          </button>
        </div>
      </div>
    </div>
  );
}
