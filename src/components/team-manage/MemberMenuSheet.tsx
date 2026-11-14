import { useRef } from 'react';

import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

import { getMemberActions, MEMBER_ACTION_COPY, type MemberAction } from './memberActions';
import { ChevronIcon } from './TeamIcons';
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
        <span className="mt-1 flex min-w-0 flex-col gap-1 tracking-[-0.03em]">
          <span className="text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#71717b]">
            선택한 팀원
          </span>
          <span className="truncate text-[20px] leading-[1.4] font-semibold text-[#18181b]">
            {member?.name}
          </span>
        </span>
      }
      showCloseButton={false}
      initialFocusRef={firstActionRef}
    >
      <ul className="mt-2 border-t border-[#f0f0f3] pb-4">
        {actions.map((action, index) => {
          const isDanger = action === 'kick';

          return (
            <li key={action} className="border-b border-[#f0f0f3] last:border-b-0">
              <button
                ref={index === 0 ? firstActionRef : undefined}
                type="button"
                onClick={() => onSelect(action)}
                className={cn(
                  'flex h-13 w-full cursor-pointer items-center justify-between text-left text-[16px] leading-[1.4] font-medium tracking-[-0.03em] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]',
                  isDanger ? 'text-[#fb2c36]' : 'text-[#18181b]',
                )}
              >
                {MEMBER_ACTION_COPY[action].menuLabel}
                <ChevronIcon className="size-5" />
              </button>
            </li>
          );
        })}
      </ul>
    </Overlay>
  );
}
