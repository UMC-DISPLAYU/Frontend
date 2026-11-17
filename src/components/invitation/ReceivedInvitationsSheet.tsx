import { useRef } from 'react';

import { ErrorView, FullSheet, FullSheetHeader } from '@/components/common';
import { SkeletonList } from '@/components/ui';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getErrorMessage } from '@/utils/error';

import { InvitationCard, InvitationCardSkeleton } from './InvitationCard';
import type { ReceivedInvitation } from './receivedInvitation';

interface ReceivedInvitationsSheetProps {
  open: boolean;
  onClose: () => void;
  invitations: ReceivedInvitation[];
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  onReject: (invitation: ReceivedInvitation) => void;
  onAccept: (invitation: ReceivedInvitation) => void;
}

export function ReceivedInvitationsSheet({
  open,
  onClose,
  invitations,
  isPending,
  error,
  onRetry,
  onReject,
  onAccept,
}: ReceivedInvitationsSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);

  const renderBody = () => {
    if (showSkeleton) {
      return (
        <ul aria-label="받은 초대를 불러오는 중" className="mt-2">
          <SkeletonList count={2}>{() => <InvitationCardSkeleton />}</SkeletonList>
        </ul>
      );
    }

    if (error && invitations.length === 0) {
      return (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, '받은 초대를 불러오지 못했어요.')}
          onRetry={onRetry}
        />
      );
    }

    if (invitations.length === 0) {
      return <p className="typography-body-md-medium pt-6 pb-3">받은 초대가 없어요</p>;
    }

    return (
      <>
        <h3 className="typography-body-xl-semibold mt-4">받은 전시 팀원 초대</h3>
        <p className="typography-body-md-medium pb-2 text-tertiary">
          초대받은 전시를 확인하고 참여 여부를 선택해보세요
        </p>
        <ul>
          {invitations.map((invitation) => (
            <InvitationCard
              invitation={invitation}
              key={invitation.invitationId}
              onAccept={() => onAccept(invitation)}
              onReject={() => onReject(invitation)}
            />
          ))}
        </ul>
      </>
    );
  };

  return (
    <FullSheet initialFocusRef={closeButtonRef} label="받은 초대" onClose={onClose} open={open}>
      {(requestClose) => (
        <>
          <FullSheetHeader
            closeButtonRef={closeButtonRef}
            onClose={requestClose}
            title="받은 초대"
          />
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-[max(32px,env(safe-area-inset-bottom))]"
            {...skeletonProps}
          >
            {renderBody()}
          </div>
        </>
      )}
    </FullSheet>
  );
}
