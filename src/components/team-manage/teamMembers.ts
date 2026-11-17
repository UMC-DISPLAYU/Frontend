import type { DisplayMemberEntryDto } from '@/api/dto';

export type TeamRole = 'owner' | 'manager' | 'member';

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  owner: '대표자',
  manager: '관리자',
  member: '팀원',
};

const TEAM_ROLE_ORDER: TeamRole[] = ['owner', 'manager', 'member'];

export const toTeamRole = (role: string): TeamRole =>
  role === 'TEAM_LEADER' ? 'owner' : role === 'MANAGER' ? 'manager' : 'member';

export interface TeamRoleGroup {
  role: TeamRole;
  members: DisplayMemberEntryDto[];
}

/** 대표자 → 관리자 → 팀원 순서로 묶고, 사람이 없는 역할은 뺀다 */
export const groupMembersByRole = (members: DisplayMemberEntryDto[]): TeamRoleGroup[] =>
  TEAM_ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((member) => toTeamRole(member.role) === role),
  })).filter((group) => group.members.length > 0);

/** 검색창 입력에서 앞뒤 공백과 맨 앞 `@` 하나를 뺀다 */
export const normalizeNickname = (value: string) => value.trim().replace(/^@/, '');

export type InviteState = 'joined' | 'waiting' | 'invitable';

export const getInviteState = (
  userId: number,
  team: { memberAccept: DisplayMemberEntryDto[]; memberPending: DisplayMemberEntryDto[] },
): InviteState => {
  if (team.memberAccept.some((member) => member.userId === userId)) return 'joined';
  if (team.memberPending.some((member) => member.userId === userId)) return 'waiting';
  return 'invitable';
};

export type TeamTab = 'joined' | 'pending';

export const getTeamTabIds = (idPrefix: string, tab: TeamTab) => ({
  tabId: `${idPrefix}-tab-${tab}`,
  panelId: `${idPrefix}-panel-${tab}`,
});
