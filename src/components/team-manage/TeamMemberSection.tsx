import { useId, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { DisplayMemberEntryDto } from '@/api/dto';
import { ErrorView } from '@/components/common';
import { Skeleton, SkeletonList } from '@/components/ui';
import {
  useChangeDisplayMemberRole,
  useRemoveDisplayMember,
  useTransferDisplayLeader,
} from '@/hooks/queries/useDisplayMembers';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';

import { JoinedMemberList } from './JoinedMemberList';
import { MemberActionDialog } from './MemberActionDialog';
import { getMemberActionToast, type MemberAction } from './memberActions';
import { MemberMenuSheet } from './MemberMenuSheet';
import { PendingInviteList } from './PendingInviteList';
import { getTeamTabIds, type TeamTab, toTeamRole } from './teamMembers';
import { TeamMemberTabs } from './TeamMemberTabs';

export interface TeamDelegatedState {
  newLeaderName: string;
  myName: string;
}

interface TeamMemberSectionProps {
  displayId: number;
  myUserId?: number;
  team?: { memberAccept: DisplayMemberEntryDto[]; memberPending: DisplayMemberEntryDto[] };
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

export function TeamMemberSection({
  displayId,
  myUserId,
  team,
  isPending,
  error,
  onRetry,
}: TeamMemberSectionProps) {
  const navigate = useNavigate();
  const idPrefix = useId();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const tab: TeamTab = searchParams.get('tab') === 'pending' ? 'pending' : 'joined';

  // 시트 · 모달은 닫히는 애니메이션 동안 내용이 남아야 해서 대상과 열림 여부를 따로 둔다
  const [menuMember, setMenuMember] = useState<DisplayMemberEntryDto | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<MemberAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const changeRole = useChangeDisplayMemberRole(displayId);
  const removeMember = useRemoveDisplayMember(displayId);
  const transferLeader = useTransferDisplayLeader(displayId);
  const mutations = [changeRole, removeMember, transferLeader];
  const isMutating = mutations.some((mutation) => mutation.isPending);
  const mutationError = mutations.find((mutation) => mutation.error)?.error;

  const changeTab = (next: TeamTab) => {
    replaceSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === 'pending') params.set('tab', 'pending');
      else params.delete('tab');
      return params;
    });
  };

  const openMenu = (member: DisplayMemberEntryDto) => {
    setMenuMember(member);
    setMenuOpen(true);
  };

  const selectAction = (action: MemberAction) => {
    mutations.forEach((mutation) => mutation.reset());
    setMenuOpen(false);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isMutating) return;
    setDialogOpen(false);
  };

  const confirmAction = () => {
    const member = menuMember;
    if (!member?.teamMemberId || !dialogAction) return;
    const memberId = member.teamMemberId;
    const name = member.displayNickname;
    const finish = () => {
      setDialogOpen(false);
      const message = getMemberActionToast(dialogAction, name);
      if (message) toast(message);
    };

    if (dialogAction === 'admin' || dialogAction === 'unadmin') {
      changeRole.mutate(
        { memberId, role: dialogAction === 'admin' ? 'MANAGER' : 'TEAM_MEM' },
        { onSuccess: finish },
      );
      return;
    }

    if (dialogAction === 'kick') {
      removeMember.mutate(memberId, { onSuccess: finish });
      return;
    }

    const myName =
      team?.memberAccept.find((entry) => entry.userId === myUserId)?.displayNickname ?? '';
    transferLeader.mutate(memberId, {
      // 위임하면 대표자 전용인 이 화면에 더 머물 수 없어 완료 화면으로 기록을 바꿔 넘어간다
      onSuccess: () =>
        navigate(`/exhibition/${displayId}/team/delegated`, {
          replace: true,
          state: { newLeaderName: name, myName } satisfies TeamDelegatedState,
        }),
    });
  };

  const renderPanel = () => {
    if (team) {
      return tab === 'pending' ? (
        <PendingInviteList members={team.memberPending} />
      ) : (
        <JoinedMemberList members={team.memberAccept} myUserId={myUserId} onOpenMenu={openMenu} />
      );
    }

    if (isPending) {
      return (
        <div aria-busy="true" aria-label="팀원을 불러오는 중" className="pt-2">
          <SkeletonList count={3}>
            {() => (
              <div className="flex min-h-17.25 items-center gap-2.75">
                <Skeleton className="size-11.5 shrink-0 rounded-circle" />
                <Skeleton className="h-5 w-24 rounded-4" />
              </div>
            )}
          </SkeletonList>
        </div>
      );
    }

    return (
      <ErrorView
        fullScreen={false}
        message={getErrorMessage(error, '팀원 목록을 불러오지 못했어요.')}
        onRetry={onRetry}
      />
    );
  };

  const { tabId, panelId } = getTeamTabIds(idPrefix, tab);

  return (
    <>
      <TeamMemberTabs
        tab={tab}
        onChange={changeTab}
        idPrefix={idPrefix}
        counts={team && { joined: team.memberAccept.length, pending: team.memberPending.length }}
      />
      <div id={panelId} role="tabpanel" aria-labelledby={tabId}>
        {renderPanel()}
      </div>

      <MemberMenuSheet
        open={menuOpen}
        member={
          menuMember && { name: menuMember.displayNickname, role: toTeamRole(menuMember.role) }
        }
        onClose={() => setMenuOpen(false)}
        onSelect={selectAction}
      />
      <MemberActionDialog
        open={dialogOpen}
        action={dialogAction}
        isPending={isMutating}
        errorMessage={
          mutationError
            ? getErrorMessage(mutationError, '요청을 처리하지 못했어요. 다시 시도해주세요.')
            : null
        }
        onCancel={closeDialog}
        onConfirm={confirmAction}
      />
    </>
  );
}
