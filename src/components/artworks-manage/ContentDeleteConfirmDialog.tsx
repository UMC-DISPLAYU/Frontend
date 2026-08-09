interface ContentDeleteConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContentDeleteConfirmDialog({
  onCancel,
  onConfirm,
}: ContentDeleteConfirmDialogProps) {
  return (
    <div
      className="absolute inset-0 z-30 grid place-items-center bg-main/35 px-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-80 rounded-[20px] bg-card/50 p-6 backdrop-blur-[10px]">
        <h2 className="typo-body-xl-bold text-center text-main">콘텐츠를 삭제할까요?</h2>
        <p className="typo-body-md-regular mt-2 text-center text-sub600">
          삭제한 콘텐츠는 전시에서 제거되며,
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
