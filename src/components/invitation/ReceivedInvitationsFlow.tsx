import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '@/components/common';
import {
  useAcceptDisplayInvitation,
  useMyDisplayInvitations,
  useRejectDisplayInvitation,
} from '@/hooks/queries/useDisplayInvitations';
import { useArtistPolicy } from '@/hooks/usePolicy';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

import { JoinArtistNameSheet } from './JoinArtistNameSheet';
import { JoinCompleteSheet, type JoinCompleteSummary } from './JoinCompleteSheet';
import {
  type ReceivedInvitation,
  toCompletePeriod,
  toReceivedInvitation,
} from './receivedInvitation';
import { ReceivedInvitationsSheet } from './ReceivedInvitationsSheet';

type JoinStep = 'artistName' | 'complete';

interface ReceivedInvitationsFlowProps {
  /** 받은 초대 시트 열림. 수락을 누르면 이 시트를 닫고(onClose) 전시 작가명 시트로 넘어간다 */
  open: boolean;
  onClose: () => void;
}

/**
 * 마이의 받은 초대 → 전시 작가명 → 참여 완료 흐름(프로토타입 my.html).
 * 미인증 사용자도 초대를 보고 거절할 수 있지만, 수락은 작가 인증이 필요하다.
 */
export function ReceivedInvitationsFlow({ open, onClose }: ReceivedInvitationsFlowProps) {
  const navigate = useNavigate();
  const canAccept = hasPermission(useArtistPolicy(), 'view');

  const invitationsQuery = useMyDisplayInvitations();
  const rejectMutation = useRejectDisplayInvitation();
  const acceptMutation = useAcceptDisplayInvitation();

  const [joinStep, setJoinStep] = useState<JoinStep | null>(null);
  const [joiningInvitation, setJoiningInvitation] = useState<ReceivedInvitation | null>(null);
  // 수락할 때마다 전시 작가명 시트를 새로 그려 빈 칸에서 시작한다
  const [joinAttempt, setJoinAttempt] = useState(0);
  const [completeSummary, setCompleteSummary] = useState<JoinCompleteSummary | null>(null);
  const [rejectingInvitation, setRejectingInvitation] = useState<ReceivedInvitation | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  const invitations = useMemo(
    () => invitationsQuery.data?.invitations.map(toReceivedInvitation) ?? [],
    [invitationsQuery.data],
  );

  const handleAccept = (invitation: ReceivedInvitation) => {
    if (!canAccept) {
      setIsVerifyDialogOpen(true);
      return;
    }

    acceptMutation.reset();
    setJoiningInvitation(invitation);
    setJoinAttempt((attempt) => attempt + 1);
    onClose();
    setJoinStep('artistName');
  };

  const handleJoin = (artistName: string) => {
    const invitation = joiningInvitation;
    if (!invitation) return;

    acceptMutation.mutate(
      { invitationId: invitation.invitationId, displayNickname: artistName },
      {
        onSuccess: () => {
          setCompleteSummary({
            displayId: invitation.displayId,
            title: invitation.title,
            organization: invitation.organization,
            period: toCompletePeriod(invitation.period),
            artistName,
          });
          // 요청 중에 시트를 닫았으면 완료 화면을 띄우지 않는다
          setJoinStep((step) => (step === 'artistName' ? 'complete' : step));
        },
      },
    );
  };

  const closeRejectDialog = () => {
    rejectMutation.reset();
    setRejectingInvitation(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectingInvitation || rejectMutation.isPending) return;

    rejectMutation.mutate(rejectingInvitation.invitationId, {
      onSuccess: () => setRejectingInvitation(null),
    });
  };

  return (
    <>
      <ReceivedInvitationsSheet
        error={invitationsQuery.error}
        invitations={invitations}
        isPending={invitationsQuery.isPending}
        onAccept={handleAccept}
        onClose={onClose}
        onReject={setRejectingInvitation}
        onRetry={() => void invitationsQuery.refetch()}
        open={open}
      />

      <JoinArtistNameSheet
        errorMessage={
          acceptMutation.isError
            ? getErrorMessage(acceptMutation.error, '전시에 참여하지 못했어요. 다시 시도해 주세요.')
            : null
        }
        isSubmitting={acceptMutation.isPending}
        key={joinAttempt}
        onClose={() => setJoinStep(null)}
        onSubmit={handleJoin}
        open={joinStep === 'artistName'}
      />

      <JoinCompleteSheet
        onClose={() => setJoinStep(null)}
        open={joinStep === 'complete'}
        summary={completeSummary}
      />

      <ConfirmDialog
        confirmLabel="거절하기"
        description={
          '거절하면 이 전시의 팀원으로 참여할 수 없어요\n참여하려면 대표자가 다시 초대해야 해요'
        }
        errorMessage={
          rejectMutation.isError
            ? getErrorMessage(rejectMutation.error, '초대를 거절하지 못했어요. 다시 시도해 주세요.')
            : null
        }
        isPending={rejectMutation.isPending}
        onCancel={closeRejectDialog}
        onConfirm={handleRejectConfirm}
        open={rejectingInvitation !== null}
        title="초대를 거절할까요?"
      />
      <ConfirmDialog
        cancelLabel="나중에"
        confirmLabel="작가 인증하기"
        description={'학교 이메일로 인증한 뒤\n초대를 수락할 수 있어요'}
        onCancel={() => setIsVerifyDialogOpen(false)}
        onConfirm={() => navigate('/artist-verification', { replace: true })}
        open={isVerifyDialogOpen}
        title={
          <>
            전시에 참여하려면
            <br />
            작가 인증이 필요해요
          </>
        }
      />
    </>
  );
}
