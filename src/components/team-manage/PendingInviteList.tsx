import type { DisplayMemberEntryDto } from '@/api/dto';

import { MemberAvatar } from './MemberAvatar';
import { InfoIcon } from './TeamIcons';

export function PendingInviteList({ members }: { members: DisplayMemberEntryDto[] }) {
  if (members.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] font-medium text-[#71717b]">
        초대 대기 중인 팀원이 없어요
      </p>
    );
  }

  return (
    <>
      <ul className="pt-1.5">
        {members.map((member, index) => (
          <li
            key={member.teamMemberId ?? member.userId}
            className="flex items-center gap-[11px] border-b border-[#f0f0f3] py-[14.5px]"
          >
            <MemberAvatar tone={index % 2 === 0 ? 'pendingAlt' : 'pending'} />
            {/* 초대 대기는 기본 닉네임으로 보여 준다(프로토타입) */}
            <span className="min-w-0 flex-1 truncate text-[14px] leading-[1.4] font-semibold">
              {member.nickname ?? member.displayNickname}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-start gap-2.5 rounded-[12px] bg-[#f4f4f5] p-4">
        <InfoIcon className="mt-px size-4.5 text-[#71717b]" />
        <p className="text-[14px] leading-[1.4] font-medium whitespace-pre-line text-[#3f3f47]">
          {'팀원 초대 수락을 기다리고 있어요\n대표자 위임과는 별개예요'}
        </p>
      </div>
    </>
  );
}
