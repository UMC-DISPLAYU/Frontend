import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DisplayMemberEntryDto } from '@/api/dto';

import {
  buildInviteLink,
  getInviteState,
  groupMembersByRole,
  normalizeNickname,
  toTeamRole,
} from './teamMembers';

const entry = (
  userId: number,
  role: string,
  accepted = true,
  teamMemberId: number | null = userId,
): DisplayMemberEntryDto => ({
  teamMemberId,
  userId,
  displayNickname: `user-${userId}`,
  role,
  accepted,
  loggedIn: true,
  artistVerified: true,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toTeamRole', () => {
  it.each([
    ['TEAM_LEADER', 'owner'],
    ['MANAGER', 'manager'],
    ['TEAM_MEM', 'member'],
    ['', 'member'],
    ['team_leader', 'member'],
  ])('%s → %s', (role, expected) => {
    expect(toTeamRole(role)).toBe(expected);
  });
});

describe('groupMembersByRole', () => {
  it('대표자 → 관리자 → 팀원 순서로 묶고 서버 순서는 묶음 안에서 유지한다', () => {
    const groups = groupMembersByRole([
      entry(3, 'TEAM_MEM'),
      entry(2, 'MANAGER'),
      entry(1, 'TEAM_LEADER'),
      entry(4, 'TEAM_MEM'),
    ]);

    expect(groups.map((group) => group.role)).toEqual(['owner', 'manager', 'member']);
    expect(groups[2].members.map((member) => member.userId)).toEqual([3, 4]);
  });

  it('사람이 없는 역할은 빼고, 아무도 없으면 빈 배열이다', () => {
    expect(groupMembersByRole([entry(1, 'TEAM_LEADER')]).map((group) => group.role)).toEqual([
      'owner',
    ]);
    expect(groupMembersByRole([])).toEqual([]);
  });
});

describe('normalizeNickname', () => {
  it.each([
    ['  quietroom  ', 'quietroom'],
    ['@quietroom', 'quietroom'],
    [' @quietroom ', 'quietroom'],
    ['@@quietroom', '@quietroom'],
    ['quiet@room', 'quiet@room'],
    ['@', ''],
    ['   ', ''],
    ['', ''],
  ])('"%s" → "%s"', (value, expected) => {
    expect(normalizeNickname(value)).toBe(expected);
  });
});

describe('getInviteState', () => {
  const team = {
    memberAccept: [entry(1, 'TEAM_LEADER'), entry(2, 'TEAM_MEM')],
    memberPending: [entry(3, 'TEAM_MEM', false, null)],
  };

  it('참여 중 · 초대 대기 · 초대 가능을 사용자 id 로 구분한다', () => {
    expect(getInviteState(1, team)).toBe('joined');
    expect(getInviteState(2, team)).toBe('joined');
    expect(getInviteState(3, team)).toBe('waiting');
    expect(getInviteState(4, team)).toBe('invitable');
  });

  it('참여와 대기에 모두 있으면 참여 중이 먼저다', () => {
    expect(
      getInviteState(5, {
        memberAccept: [entry(5, 'TEAM_MEM')],
        memberPending: [entry(5, 'TEAM_MEM', false, null)],
      }),
    ).toBe('joined');
  });

  it('팀원이 아무도 없으면 초대할 수 있다', () => {
    expect(getInviteState(1, { memberAccept: [], memberPending: [] })).toBe('invitable');
  });
});

describe('buildInviteLink', () => {
  it('현재 사이트 주소의 초대 링크 화면 경로로 만든다', () => {
    vi.stubGlobal('window', { location: { origin: 'https://displayu.co.kr' } });

    expect(buildInviteLink('abc123')).toBe('https://displayu.co.kr/display/invitation/abc123');
  });
});
