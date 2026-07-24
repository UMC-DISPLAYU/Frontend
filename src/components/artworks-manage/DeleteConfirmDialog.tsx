interface DeleteConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ onCancel, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-main/35 px-5" role="dialog" aria-modal="true">
      <div className="w-80 rounded-[20px] bg-card/50 p-6 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px]">
        <h2 className="typo-body-xl-bold text-center text-main">작품을 삭제할까요?</h2>
        <p className="typo-body-md-regular mt-2 text-center text-sub600">
          삭제한 작품은 전시에서 제거되며,
          <br />
          복구할 수 없어요.
        </p>

        <div className="mt-6 flex gap-2.5">
          <button
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
