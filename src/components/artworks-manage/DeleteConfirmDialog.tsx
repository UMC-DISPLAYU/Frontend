import React from 'react';

interface DeleteConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ onCancel, onConfirm }: DeleteConfirmDialogProps) {
  const titleId = 'delete-confirm-title';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 id={titleId} className="typo-title-sm mb-4">
          삭제 확인
        </h2>
        <p className="typo-body-sm mb-6">정말 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
