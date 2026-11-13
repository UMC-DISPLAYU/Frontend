import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { requestReceivedInvitations } from './receivedInvitationsRequest';

/** `/invitation-request`(초대 링크 · 기존 설정 화면이 보내는 경로)를 마이의 받은 초대 시트로 잇는다 */
export function ReceivedInvitationsRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    requestReceivedInvitations();
    void navigate('/my', { replace: true });
  }, [navigate]);

  return null;
}
