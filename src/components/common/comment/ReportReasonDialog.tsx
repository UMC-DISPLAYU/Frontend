import { Overlay } from '@/components/ui';

import { REPORT_REASONS, type ReportReason } from './reportReasons';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (reason: ReportReason) => void;
};

/* 프로토타입 report.js: 가운데 모달 폭 322, 사유를 누르면 바로 닫히고 접수된다(직접 입력 없음) */
export function ReportReasonDialog({ open, onClose, onSelect }: Props) {
  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="신고 사유를 선택해주세요"
      size="sm"
      presentation="modal"
      showCloseButton={false}
      className="max-w-80.5 pb-3"
    >
      <ul className="-mt-2">
        {REPORT_REASONS.map((reason) => (
          <li key={reason} className="border-b border-[#d4d4d8] last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(reason)}
              className="h-13 w-full cursor-pointer text-left text-[16px] font-medium tracking-[-0.03em] text-[#18181b] transition-opacity duration-fast focus-visible:outline-2 focus-visible:outline-focus active:opacity-55"
            >
              {reason}
            </button>
          </li>
        ))}
      </ul>
    </Overlay>
  );
}
