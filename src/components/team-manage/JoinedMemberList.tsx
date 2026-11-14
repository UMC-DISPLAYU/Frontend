import type { DisplayMemberEntryDto } from '@/api/dto';
import MoreIcon from '@/assets/team-manage/MoreIcon.svg';

import { MemberAvatar } from './MemberAvatar';
import { RoleBadge } from './RoleBadge';
import { groupMembersByRole, TEAM_ROLE_LABEL } from './teamMembers';

interface JoinedMemberListProps {
  members: DisplayMemberEntryDto[];
  myUserId?: number;
  onOpenMenu: (member: DisplayMemberEntryDto) => void;
}

export function JoinedMemberList({ members, myUserId, onOpenMenu }: JoinedMemberListProps) {
  return (
    <div className="pt-0.5">
      {groupMembersByRole(members).map(({ role, members: group }) => (
        <section
          key={role}
          aria-label={TEAM_ROLE_LABEL[role]}
          className="border-b border-primary last:border-b-0"
        >
          <h4 className="typography-body-md-semibold pt-2.5 text-tertiary">
            {TEAM_ROLE_LABEL[role]}
          </h4>
          {group.map((member) => {
            const name = member.displayNickname;
            // 대표자와 나 자신은 메뉴가 없다(프로토타입)
            const hasMenu = role !== 'owner' && member.userId !== myUserId;

            return (
              <div
                key={member.teamMemberId ?? member.userId}
                className="flex min-h-17.25 items-center"
              >
                <MemberAvatar tone={role} />
                <p className="flex min-w-0 flex-1 items-center gap-1.5 pr-2 pl-2.75">
                  <span className="typography-body-lg-semibold max-w-33 truncate text-primary">
                    {name}
                  </span>
                  <RoleBadge role={role} />
                </p>
                {hasMenu && (
                  <button
                    type="button"
                    aria-label={`${name} 메뉴`}
                    aria-haspopup="dialog"
                    onClick={() => onOpenMenu(member)}
                    // 피그마처럼 점 세 개를 줄 오른쪽 끝에 맞추고, 누르는 영역(44)은 점을 가운데에 둔다
                    className="-mr-3.5 flex size-11 shrink-0 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-99"
                  >
                    <img src={MoreIcon} alt="" />
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
