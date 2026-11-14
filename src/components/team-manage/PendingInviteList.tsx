import type { DisplayMemberEntryDto } from '@/api/dto';

import { MemberAvatar } from './MemberAvatar';

export function PendingInviteList({ members }: { members: DisplayMemberEntryDto[] }) {
  if (members.length === 0) {
    return (
      <p className="typography-body-lg-medium py-12 text-center text-tertiary">
        초대 대기 중인 팀원이 없어요
      </p>
    );
  }

  return (
    <>
      <ul className="pt-2">
        {members.map((member, index) => (
          <li
            key={member.teamMemberId ?? member.userId}
            className="flex min-h-19 items-center border-b border-primary"
          >
            <MemberAvatar tone={index % 2 === 0 ? 'pendingAlt' : 'pending'} />
            <span className="typography-body-md-medium min-w-0 flex-1 truncate pt-1 pl-2.5 text-tertiary">
              {member.displayNickname}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-start gap-2.5 rounded-12 bg-secondary p-4">
        <InfoIcon />
        <p className="typography-body-lg-medium whitespace-pre-line text-secondary">
          {'팀원 초대 수락을 기다리고 있어요\n대표자 위임과는 별개예요'}
        </p>
      </div>
    </>
  );
}

/* 프로토타입 i-info 아이콘. 피그마에 이 안내 상자가 없어 프로토타입 그림을 그대로 옮겼다 */
function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px size-4.5 shrink-0 text-icon-tertiary"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.2" />
    </svg>
  );
}
