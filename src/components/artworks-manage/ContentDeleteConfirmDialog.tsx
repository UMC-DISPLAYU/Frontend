import { useRef } from 'react';

import { Overlay } from '@/components/ui';

interface ContentDeleteConfirmDialogProps {
  open: boolean;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContentDeleteConfirmDialog({
  open,
  isDeleting = false,
  errorMessage,
  onCancel,
  onConfirm,
}: ContentDeleteConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      title="섹션을 삭제할까요?"
      role="alertdialog"
      size="sm"
      presentation="modal"
      className="max-w-80.5"
      showCloseButton={false}
      initialFocusRef={cancelButtonRef}
      footer={
        <div className="flex gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-12 bg-[#f0f0f3] text-[14px] font-semibold tracking-[-0.03em] text-[#18181b] transition duration-fast hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-98"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-11 flex-1 rounded-12 bg-[#fb2c36] text-[14px] font-semibold tracking-[-0.03em] text-[#fff] transition duration-fast hover:bg-[#d63c41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-98 disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100"
          >
            {isDeleting ? '삭제 중…' : '삭제하기'}
          </button>
        </div>
      }
    >
      {/* 프로토타입 모달: 본문 14 Regular · 경고 상자 #ffe2e2(제목 12 SemiBold 빨강, 내용 12 Medium) */}
      <p className="-mt-2 text-[14px] leading-[1.4] font-normal tracking-[-0.03em] text-[#71717b]">
        섹션에 등록된 사진도 함께 삭제돼요
      </p>
      <div className="mt-4 rounded-12 bg-[#ffe2e2] px-3.5 py-3 tracking-[-0.03em]">
        <b className="block text-[12px] font-semibold text-[#fb2c36]">삭제 안내</b>
        <span className="mt-0.5 block text-[12px] leading-[1.4] font-medium text-[#3f3f47]">
          삭제된 섹션은 복구할 수 없어요
        </span>
        {errorMessage && (
          <p role="alert" className="mt-1 text-[12px] font-medium text-[#fb2c36]">
            {errorMessage}
          </p>
        )}
      </div>
    </Overlay>
  );
}
