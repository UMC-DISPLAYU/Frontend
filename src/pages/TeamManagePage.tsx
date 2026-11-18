import { useNavigate, useParams } from 'react-router-dom';

import {
  InviteLinkCard,
  NicknameInviteCard,
  TeamHeader,
  TeamMemberSection,
  TeamPage,
} from '@/components/team-manage';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';

export function TeamManage() {
  const navigate = useNavigate();
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam);

  // 대표자 권한 가드가 전시 상세를 먼저 불러온 뒤에 그려진다
  const { data: display } = useDisplayDetail(displayId);
  const members = useDisplayMembers(displayId);
  const { data: me } = useUserMe();

  return (
    <TeamPage>
      {/* 등록 완료 · 전시 관리 등 어디서 들어와도 기록을 되돌리지 않고 전시 관리로 간다(전시 작업 뒤로가기와 같다) */}
      <TeamHeader
        title="팀원 관리"
        onBack={() => navigate(`/exhibition/${displayId}/manage`)}
        backLabel="전시 관리로 돌아가기"
      />
      <div className="mt-3 flex items-baseline gap-2.5">
        <h2 className="shrink-0 text-[16px] leading-[1.4] font-semibold">팀원 초대</h2>
        <p className="min-w-0 text-[12px] leading-[1.4] font-medium text-[#71717b]">
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
      {/* 마지막 팀원이 화면 끝에 붙지 않게 비운다. 작품 상세 세로 보기 아래 여백(64)과 맞춘다 */}
      <div aria-hidden="true" className="h-16 shrink-0" />
    </TeamPage>
  );
}
