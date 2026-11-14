import { TEAM_ROLE_LABEL, type TeamRole } from './teamMembers';

/* 대표자 · 관리자 · 팀원 모두 같은 회색 배지(디자인 확정) */
export function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center rounded-[4px] bg-[#f0f0f3] px-2 text-[10px] leading-[1.4] font-semibold tracking-[-0.03em] text-[#3f3f47]">
      {TEAM_ROLE_LABEL[role]}
    </span>
  );
}
