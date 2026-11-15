/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { fail, paths, readJson, success, toNumber } from '@/mocks/response';

const MEMBERS_PATH = '/api/v1/display/{displayId}/members';
const MEMBER_PATH = '/api/v1/display/{displayId}/members/{memberId}';
const ROLE_PATH = '/api/v1/display/{displayId}/members/{memberId}/role';
const LEADER_TRANSFER_PATH = '/api/v1/display/{displayId}/leader-transfer';
const CANCEL_INVITATION_PATH = '/api/v1/display-invitations/{invitationId}';

const findDisplay = (displayId: number) =>
  mockDb.displays.find((display: any) => display.displayId === displayId) ?? mockDb.displays[0];

const member = (
  teamMemberId: number | null,
  userId: number,
  displayNickname: string,
  role: string,
  accepted = true,
  invitationId: number | null = null,
) => ({
  teamMemberId,
  userId,
  displayNickname,
  role,
  accepted,
  loggedIn: true,
  artistVerified: accepted,
  invitationId,
});

/*
 * 팀원 관리 화면을 확인할 수 있게 처음 조회할 때 대표자(나) · 관리자 · 팀원 · 초대 대기를 채운다.
 * 사용자는 닉네임 검색 목(searchableUsers)과 같은 사람이라 검색하면 `참여 중` · `초대 대기`로 보인다.
 * 초대 대기는 실서버처럼 teamMemberId 가 없다.
 */
export const teamOf = (display: any): any[] => {
  if (!display.teamMembers?.length) {
    const base = display.displayId * 100;
    display.teamMembers = [
      member(base + 1, mockDb.me.userId, mockDb.me.nickname, 'TEAM_LEADER'),
      member(base + 2, 205, '한도윤', 'MANAGER'),
      member(base + 3, 203, '김서연', 'TEAM_MEM'),
      member(base + 4, 204, '박지훈', 'TEAM_MEM'),
      member(null, 209, 'chaerin_j', 'TEAM_MEM', false, base + 9),
      member(null, 210, 'quriosity', 'TEAM_MEM', false, base + 10),
    ];
  }

  return display.teamMembers;
};

/* 기본 닉네임은 닉네임 검색 목과 같은 사람에서 가져온다 */
const withNickname = (entry: any) => ({
  ...entry,
  nickname: [mockDb.me, ...mockDb.searchableUsers].find(
    (user: { userId: number }) => user.userId === entry.userId,
  )?.nickname,
});

const findAcceptedMember = (display: any, memberId: number) =>
  teamOf(display).find((entry) => entry.teamMemberId === memberId && entry.accepted !== false);

export const displayMemberHandlers = [
  ...paths(MEMBERS_PATH).map((path) =>
    http.get(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const members = teamOf(findDisplay(displayId));

      return success(MEMBERS_PATH, {
        displayId,
        memberAccept: members.filter((entry) => entry.accepted !== false).map(withNickname),
        memberPending: members.filter((entry) => entry.accepted === false).map(withNickname),
      });
    }),
  ),
  // PATCH: 관리자 지정(MANAGER) · 해제(TEAM_MEM). 대표자는 바꿀 수 없다
  ...paths(ROLE_PATH).map((path) =>
    http.patch(path, async ({ params, request }) => {
      const displayId = toNumber(params.displayId, 101);
      const target = findAcceptedMember(findDisplay(displayId), toNumber(params.memberId));
      const { role } = await readJson<{ role: string }>(request);

      if (!target)
        return fail(ROLE_PATH, 404, 'DISPLAY_MEMBER_NOT_FOUND', '팀원을 찾을 수 없어요.');
      if (target.role === 'TEAM_LEADER' || (role !== 'MANAGER' && role !== 'TEAM_MEM')) {
        return fail(
          ROLE_PATH,
          409,
          'DISPLAY_MEMBER_ROLE_CONFLICT',
          '역할을 바꿀 수 없는 팀원이에요.',
        );
      }

      target.role = role;

      return success(ROLE_PATH, {
        displayId,
        teamMemberId: target.teamMemberId,
        userId: target.userId,
        role,
      });
    }),
  ),
  // DELETE: 팀원 내보내기. 대표자는 내보낼 수 없다
  ...paths(MEMBER_PATH).map((path) =>
    http.delete(path, ({ params }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const target = findAcceptedMember(display, toNumber(params.memberId));

      if (!target)
        return fail(MEMBER_PATH, 404, 'DISPLAY_MEMBER_NOT_FOUND', '팀원을 찾을 수 없어요.');
      if (target.role === 'TEAM_LEADER') {
        return fail(
          MEMBER_PATH,
          409,
          'DISPLAY_LEADER_REMOVE_CONFLICT',
          '대표자는 내보낼 수 없어요.',
        );
      }

      display.teamMembers = teamOf(display).filter((entry) => entry !== target);

      return success(MEMBER_PATH, {
        displayId,
        removedMemberId: target.teamMemberId,
        removedUserId: target.userId,
        deletedArtworkCount: 0,
      });
    }),
  ),
  // DELETE: 초대 취소. 대기 중인 초대만 취소되고 응답 status 는 CANCELLED 다
  ...paths(CANCEL_INVITATION_PATH).map((path) =>
    http.delete(path, ({ params }) => {
      const invitationId = toNumber(params.invitationId);
      const display = mockDb.displays.find((item: any) =>
        (item.teamMembers ?? []).some((entry: any) => entry.invitationId === invitationId),
      );
      const target = display?.teamMembers.find(
        (entry: any) => entry.invitationId === invitationId && entry.accepted === false,
      );

      if (!display || !target) {
        return fail(
          CANCEL_INVITATION_PATH,
          404,
          'DISPLAY_INVITATION_NOT_FOUND',
          '대기 중인 초대를 찾을 수 없어요.',
        );
      }

      display.teamMembers = teamOf(display).filter((entry) => entry !== target);

      return success(CANCEL_INVITATION_PATH, {
        invitationId,
        displayId: display.displayId,
        inviterUserId: mockDb.me.userId,
        inviteeUserId: target.userId,
        status: 'CANCELLED',
        createdAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      });
    }),
  ),
  // POST: 대표자 위임. 즉시 바뀌고 이전 대표자는 관리자가 된다
  ...paths(LEADER_TRANSFER_PATH).map((path) =>
    http.post(path, async ({ params, request }) => {
      const displayId = toNumber(params.displayId, 101);
      const display = findDisplay(displayId);
      const { targetMemberId } = await readJson<{ targetMemberId: number }>(request);
      const target = findAcceptedMember(display, Number(targetMemberId));
      const leader = teamOf(display).find((entry) => entry.role === 'TEAM_LEADER');

      if (!target || !leader) {
        return fail(
          LEADER_TRANSFER_PATH,
          404,
          'DISPLAY_MEMBER_NOT_FOUND',
          '팀원을 찾을 수 없어요.',
        );
      }
      if (target === leader) {
        return fail(LEADER_TRANSFER_PATH, 409, 'DISPLAY_LEADER_CONFLICT', '이미 대표자예요.');
      }

      leader.role = 'MANAGER';
      target.role = 'TEAM_LEADER';
      display.ownerUserId = target.userId;

      const summary = (entry: any) => ({
        teamMemberId: entry.teamMemberId,
        userId: entry.userId,
        role: entry.role,
      });

      return success(LEADER_TRANSFER_PATH, {
        displayId,
        previousLeader: summary(leader),
        newLeader: summary(target),
      });
    }),
  ),
];
