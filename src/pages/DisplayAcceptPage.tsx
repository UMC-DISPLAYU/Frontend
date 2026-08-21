import { Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BottomButton } from '@/components/common';
import type { Invitation } from '@/types/invitation';

type InfoRow = { label: string; value: string };
type InvitationCompleteLocationState = {
  invitation?: Invitation;
  invitationFlowBackIndex?: number | null;
};

function buildExhibitionInfo(invitation?: Invitation): InfoRow[] {
  return [
    { label: '전시명', value: invitation?.title ?? '-' },
    { label: '소속', value: invitation?.department ?? '-' },
    { label: '기간', value: invitation?.period ?? '-' },
    { label: '역할', value: '팀원' },
  ];
}

function SummaryRow({ label, value }: InfoRow) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-3">
      <span className="typo-body-xs-regular w-10 shrink-0 text-faint">{label}</span>
      <span className="typo-body-xs-regular min-w-0 truncate text-main">{value}</span>
    </div>
  );
}

export function DisplayAcceptPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as InvitationCompleteLocationState | null;
  const invitation = state?.invitation;

  const [titleRow, departmentRow, periodRow, roleRow] = buildExhibitionInfo(invitation);

  const handleGoManage = () => {
    navigate('/my/exhibitions', {
      replace: true,
      state: { completedFlowBackIndex: state?.invitationFlowBackIndex ?? null },
    });
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-38.5">
        <div className="items-center justify-center translate-y-30">
          <div className="mx-auto w-49.5 flex flex-col items-center justify-center gap-1.5">
            <div className="flex size-20 items-center justify-center rounded-full bg-box200">
              <div className="flex size-12 items-center justify-center rounded-full bg-dark">
                <Check className="size-6 text-white" strokeWidth={2.8} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h1 className="typo-body-xl-bold text-center text-main">전시 참여가 완료되었어요</h1>
              <p className="typo-body-xs-regular text-center text-faint">
                이제 이 전시가 내 전시 관리에 추가돼요.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-35 pb-15 flex flex-col gap-5 translate-x-2">
          <div className="flex items-start gap-1.5 rounded-2xl px-4 py-3.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <SummaryRow {...titleRow} />
              <SummaryRow {...departmentRow} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <SummaryRow {...periodRow} />
              <SummaryRow {...roleRow} />
            </div>
          </div>
        </section>
      </div>

      <BottomButton type="button" onClick={handleGoManage}>
        내 전시 관리로 이동
      </BottomButton>
    </div>
  );
}
