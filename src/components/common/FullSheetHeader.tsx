import type { RefObject } from 'react';

interface FullSheetHeaderProps {
  title: string;
  /** FullSheet 의 requestClose 를 넘긴다 */
  onClose: () => void;
  /** 시트가 열릴 때 처음 포커스할 닫기 버튼. FullSheet 의 initialFocusRef 와 같은 ref 를 넘긴다 */
  closeButtonRef?: RefObject<HTMLButtonElement>;
}

/** 프로토타입 마이 전체 화면 시트(받은 초대 · 알림함)의 머리: 뒤로(닫기) + 제목 */
export function FullSheetHeader({ title, onClose, closeButtonRef }: FullSheetHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-1 px-3">
      <button
        aria-label="닫기"
        className="grid size-11 place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
          viewBox="0 0 24 24"
          width="20"
        >
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>
      <h2 className="typography-body-xxl-semibold ml-1">{title}</h2>
    </div>
  );
}
