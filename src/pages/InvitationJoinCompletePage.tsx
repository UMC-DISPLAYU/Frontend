import { Navigate, useLocation } from 'react-router-dom';

import { type JoinCompleteSummary, JoinCompleteView } from '@/components/invitation';
import { PageContainer } from '@/components/layout';

const readJoinComplete = (state: unknown): JoinCompleteSummary | null => {
  if (typeof state !== 'object' || state === null) return null;

  const { joinComplete } = state as { joinComplete?: JoinCompleteSummary };
  return typeof joinComplete?.displayId === 'number' ? joinComplete : null;
};

/** 받은 초대 수락 후 참여 완료. 수락 흐름이 넘겨 준 요약이 없으면(주소로 직접 들어옴) 마이로 보낸다 */
export function InvitationJoinCompletePage() {
  const location = useLocation();
  const summary = readJoinComplete(location.state);

  if (!summary) return <Navigate to="/my" replace />;

  return (
    <PageContainer variant="form">
      <JoinCompleteView summary={summary} />
    </PageContainer>
  );
}
