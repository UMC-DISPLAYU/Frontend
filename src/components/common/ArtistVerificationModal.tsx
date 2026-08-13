import { useEffect, useId, useRef } from 'react';

type Props = {
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ArtistVerificationModal({ description, onConfirm, onCancel }: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="작가 인증"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 px-10"
    >
      <div className="relative w-80 h-60 bg-neutral-50/40 rounded-[20px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] overflow-hidden">
        <div className="absolute inset-x-4 top-6 h-48 flex flex-col justify-between items-center">
          <div className="w-full flex flex-col items-center gap-2">
            <h3 className="w-full text-center typo-body-xl-bold text-modal-title">
              작가 인증이 필요해요
            </h3>
            <p
              id={descriptionId}
              className="w-full text-center typo-body-md-regular text-modal-desc whitespace-pre-line"
            >
              {description}
            </p>
          </div>

          <div className="w-full flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full h-11 bg-modal-btn-hover-bg rounded-full flex justify-center items-center gap-2.5"
            >
              <span className="text-center typo-body-lg-bold text-modal-btn-hover-fg">
                학교 이메일로 인증하기
              </span>
            </button>
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="w-full h-11 bg-modal-btn-bg rounded-full flex justify-center items-center gap-2.5"
            >
              <span className="text-center typo-body-lg-regular text-modal-btn-fg">취소</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
