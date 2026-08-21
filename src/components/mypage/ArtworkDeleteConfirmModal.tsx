import { useEffect, useId, useRef } from 'react';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function ArtworkDeleteConfirmModal({ onConfirm, onCancel }: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="작품 삭제"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-5"
    >
      <div className="flex w-full max-w-80 flex-col gap-7 overflow-hidden rounded-[20px] bg-neutral-50/20 p-5 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.04),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px]">
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className="text-center typo-body-xl-bold text-modal-title">작품을 삭제할까요?</h3>
          <p id={descriptionId} className="text-center typo-body-md-regular text-modal-desc">
            삭제한 작품은 복구할 수 없어요.
            <br />
            정말 삭제하시겠어요?
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-modal-btn-hover-bg px-3"
          >
            <span className="typo-body-lg-regular text-modal-btn-hover-fg">삭제하기</span>
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-modal-btn-bg px-3"
          >
            <span className="typo-body-lg-regular text-modal-btn-fg">취소</span>
          </button>
        </div>
      </div>
    </div>
  );
}
