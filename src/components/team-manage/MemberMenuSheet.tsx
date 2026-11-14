import { useRef } from 'react';

import ChevronIcon from '@/assets/exhibition-work/ChevronIcon.svg';
import ChevronDangerIcon from '@/assets/team-manage/ChevronDangerIcon.svg';
import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

import { getMemberActions, MEMBER_ACTION_COPY, type MemberAction } from './memberActions';
import { RoleBadge } from './RoleBadge';
import type { TeamRole } from './teamMembers';

interface MemberMenuSheetProps {
  open: boolean;
  /** 닫히는 애니메이션 동안에도 내용이 남도록 닫은 뒤에도 마지막 팀원을 넘긴다 */
  member: { name: string; role: TeamRole } | null;
  onClose: () => void;
  onSelect: (action: MemberAction) => void;
}

export function MemberMenuSheet({ open, member, onClose, onSelect }: MemberMenuSheetProps) {
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const actions = member ? getMemberActions(member.role) : [];

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="typography-body-sm-regular text-tertiary">선택한 팀원</span>
            <span className="typography-body-xxl-semibold truncate text-primary">
              {member?.name}
            </span>
          </span>
          {member && <RoleBadge role={member.role} />}
        </span>
      }
      showCloseButton={false}
      initialFocusRef={firstActionRef}
    >
      <ul className="mt-5 border-t border-primary pb-4">
        {actions.map((action, index) => {
          const isDanger = action === 'kick';

          return (
            <li key={action}>
              <button
                ref={index === 0 ? firstActionRef : undefined}
                type="button"
                onClick={() => onSelect(action)}
                className={cn(
                  'typography-body-lg-regular flex h-13 w-full items-center justify-between border-b border-primary text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                  isDanger ? 'text-error' : 'text-primary',
                )}
              >
                {MEMBER_ACTION_COPY[action].menuLabel}
                <span aria-hidden="true" className="flex size-5 items-center justify-center">
                  <img src={isDanger ? ChevronDangerIcon : ChevronIcon} alt="" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}
