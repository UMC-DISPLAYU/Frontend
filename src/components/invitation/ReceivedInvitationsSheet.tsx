import { useRef } from 'react';

import { ErrorView } from '@/components/common';
import { SkeletonList } from '@/components/ui';
import { getErrorMessage } from '@/utils/error';

import { FullSheet } from './FullSheet';
import { InvitationCard, InvitationCardSkeleton } from './InvitationCard';
import { BackIcon } from './InvitationIcons';
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

  const renderBody = () => {
    if (isPending) {
      return (
        <ul aria-busy="true" aria-label="받은 초대를 불러오는 중" className="mt-2">
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
          <div className="flex h-14 shrink-0 items-center gap-1 px-3">
            <button
              aria-label="닫기"
              className="grid size-10 place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
              onClick={requestClose}
              ref={closeButtonRef}
              type="button"
            >
              <BackIcon />
            </button>
            <h2 className="typography-body-xxl-semibold ml-1">받은 초대</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-[max(32px,env(safe-area-inset-bottom))]">
            {renderBody()}
          </div>
        </>
      )}
    </FullSheet>
  );
}
