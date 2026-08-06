import { createPortal } from 'react-dom';

import { useNavigate } from 'react-router-dom';

import { cn } from '@/utils/cn';

type LoginConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  redirectPath?: string;
  className?: string;
};

export function LoginConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  redirectPath,
  className,
}: LoginConfirmModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
      navigate('/login', {
        state: redirectPath ? { from: { pathname: redirectPath } } : undefined,
      });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5 animate-fade-in">
      <div
        className={cn(
          'relative flex h-48 w-80 flex-col justify-between overflow-hidden rounded-[20px] bg-white/70 p-6 backdrop-blur-md',
          'shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)]',
          className,
        )}
      >
        <div className="flex flex-col items-start justify-start pl-1 pt-1 gap-2">
          <h3 className="typo-heading-xl text-modal-title">Display U</h3>
          <p className="typo-body-md-regular text-modal-desc whitespace-pre-line">
            로그인 후 이용할 수 있습니다.{'\n'}로그인 페이지로 이동하시겠습니까?
          </p>
        </div>

        <div className="flex w-full items-center justify-start gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex h-11 w-44 items-center justify-center gap-2.5 rounded-[100px] bg-modal-btn-hover-bg pt-3.5 pb-3.5 text-lg font-normal text-modal-btn-hover-fg transition-transform cursor-pointer active:scale-[0.98]"
          >
            확인
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-44 items-center justify-center gap-2.5 rounded-[100px] bg-modal-btn-bg pt-3.5 pb-3.5 text-lg font-normal text-modal-btn-fg transition-transform cursor-pointer active:scale-[0.98]"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
