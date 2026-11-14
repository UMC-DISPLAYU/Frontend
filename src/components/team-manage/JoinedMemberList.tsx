import type { DisplayMemberEntryDto } from '@/api/dto';

import { MemberAvatar } from './MemberAvatar';
import { MoreIcon } from './TeamIcons';
import { groupMembersByRole, TEAM_ROLE_LABEL } from './teamMembers';

interface JoinedMemberListProps {
  members: DisplayMemberEntryDto[];
  myUserId?: number;
  onOpenMenu: (member: DisplayMemberEntryDto) => void;
}

export function JoinedMemberList({ members, myUserId, onOpenMenu }: JoinedMemberListProps) {
  return (
    <div>
      {groupMembersByRole(members).map(({ role, members: group }) => (
        <section
          key={role}
          aria-label={TEAM_ROLE_LABEL[role]}
          className="pt-2.5 [&+&]:border-t [&+&]:border-[#f0f0f3]"
        >
          <h4 className="text-[12px] font-semibold text-[#71717b]">{TEAM_ROLE_LABEL[role]}</h4>
          {group.map((member) => {
            const name = member.displayNickname;
            // 대표자와 나 자신은 메뉴가 없다(프로토타입)
            const hasMenu = role !== 'owner' && member.userId !== myUserId;

            return (
              <div
                key={member.teamMemberId ?? member.userId}
                className="flex items-center gap-[11px] py-[11.5px]"
              >
                <MemberAvatar />
                {/* 전시 작가명 아래에 기본 닉네임(프로토타입 .nm b · small) */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] leading-[1.4] font-semibold">{name}</p>
                  {member.nickname && (
                    <p className="mt-[3px] truncate text-[12px] leading-[17px] font-medium text-[#3f3f47]">
                      {member.nickname}
                    </p>
                  )}
                </div>
                {hasMenu && (
                  <button
                    type="button"
                    aria-label={`${name} 메뉴`}
                    aria-haspopup="dialog"
                    onClick={() => onOpenMenu(member)}
                    // 보이는 크기는 40, 누르는 영역은 after 로 44 까지 넓힌다
                    className="relative flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 after:absolute after:-inset-0.5 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]"
                  >
                    <MoreIcon />
                  </button>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
