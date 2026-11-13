import { useParams } from 'react-router-dom';

import { WorkHeader } from '@/components/exhibition-work';
import { PageContainer } from '@/components/layout';
import { InviteLinkCard, NicknameInviteCard, TeamMemberSection } from '@/components/team-manage';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';

export function TeamManage() {
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam);

  // 대표자 권한 가드가 전시 상세를 먼저 불러온 뒤에 그려진다
  const { data: display } = useDisplayDetail(displayId);
  const members = useDisplayMembers(displayId);
  const { data: me } = useUserMe();

  return (
    <PageContainer variant="form" className="bg-primary-white pb-7 text-primary">
      <WorkHeader title="팀원 관리" />
      <div className="mt-1 flex items-baseline gap-2.5">
        <h2 className="typography-body-xl-semibold shrink-0">팀원 초대</h2>
        <p className="typography-body-md-medium min-w-0 text-tertiary">
          함께 전시를 준비할 팀원을 초대해보세요
        </p>
      </div>
      <InviteLinkCard
        displayId={displayId}
        invitationToken={display?.invitationToken}
        invitationDisabledAt={display?.invitationDisabledAt}
      />
      <NicknameInviteCard displayId={displayId} team={members.data} />
      <TeamMemberSection
        displayId={displayId}
        myUserId={me?.id}
        team={members.data}
        isPending={members.isPending}
        error={members.error}
        onRetry={() => void members.refetch()}
      />
    </PageContainer>
  );
}
