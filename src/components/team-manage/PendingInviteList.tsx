import type { DisplayMemberEntryDto } from '@/api/dto';
import { useCancelDisplayInvitation } from '@/hooks/queries/useDisplayMembers';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';

import { MemberAvatar } from './MemberAvatar';

interface PendingInviteListProps {
  displayId: number;
  members: DisplayMemberEntryDto[];
}

export function PendingInviteList({ displayId, members }: PendingInviteListProps) {
  const cancel = useCancelDisplayInvitation(displayId);

  const cancelInvite = ({ invitationId }: DisplayMemberEntryDto) => {
    if (invitationId == null) {
      toast('초대 정보를 찾지 못했어요. 새로고침 후 다시 시도해주세요.');
      return;
    }
    cancel.mutate(invitationId, {
      onSuccess: () => toast('초대를 취소했어요'),
      onError: (error) =>
        toast(getErrorMessage(error, '초대를 취소하지 못했어요. 다시 시도해주세요.')),
    });
  };

  if (members.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] font-medium text-[#71717b]">
        초대 대기 중인 팀원이 없어요
      </p>
    );
  }

  return (
    <ul className="pt-1.5">
      {members.map((member) => {
        // 초대 대기는 기본 닉네임으로 보여 준다(프로토타입)
        const name = member.nickname || member.displayNickname;

        return (
          <li
            key={member.teamMemberId ?? member.userId}
            className="flex items-center gap-[11px] border-b border-[#f0f0f3] py-[14.5px]"
          >
            <MemberAvatar />
            <span className="min-w-0 flex-1 truncate text-[14px] leading-[1.4] font-semibold">
              {name}
            </span>
            <button
              type="button"
              aria-label={`${name} 초대 취소`}
              disabled={cancel.isPending}
              onClick={() => cancelInvite(member)}
              // 보이는 높이는 33px, 누르는 영역은 after 로 44px 까지 넓힌다
              className="relative shrink-0 py-2 pl-2 text-[12px] font-medium text-[#18181b] after:absolute after:inset-x-0 after:-inset-y-[5.5px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] disabled:cursor-default disabled:no-underline"
            >
              초대 취소
            </button>
          </li>
        );
      })}
    </ul>
  );
}
