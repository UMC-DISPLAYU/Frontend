import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { displayHandlers } from './display';
import { displayMemberHandlers } from './displayMember';

const server = setupServer(...displayHandlers, ...displayMemberHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const BASE = 'http://localhost/api/v1';

const getData = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${BASE}${path}`, init);
  const body = await response.json();
  return body.success.data;
};

const post = (path: string, body?: unknown) =>
  getData(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

// 목 데이터는 모듈 상태라 테스트가 순서대로 이어진다(받은 초대 2건 → 거절 → 수락)
it('받은 초대 목록에 처리 대기 초대가 있다', async () => {
  const data = await getData('/display-invitations/me');

  expect(data.invitations.map((item: { invitationId: number }) => item.invitationId)).toEqual([
    1, 2,
  ]);
});

it('거절한 초대는 목록에서 빠진다', async () => {
  const rejected = await post('/display-invitations/1/reject');
  const data = await getData('/display-invitations/me');

  expect(rejected).toMatchObject({ invitationId: 1, status: 'REJECTED' });
  expect(data.invitations.map((item: { invitationId: number }) => item.invitationId)).toEqual([2]);
});

it('수락하면 목록에서 빠지고 응답에 전시 id 가 온다', async () => {
  const accepted = await post('/display-invitations/2/accept', { displayNickname: '김디유' });
  const data = await getData('/display-invitations/me');

  expect(accepted).toMatchObject({ invitationId: 2, displayId: 102, status: 'ACCEPTED' });
  expect(data.invitations).toEqual([]);
});

it('수락한 뒤에도 팀원 관리 목의 대표자 · 팀원 목록이 그대로 있다', async () => {
  const data = await getData('/display/102/members');
  const roles = data.memberAccept.map((member: { role: string }) => member.role);

  expect(roles).toContain('TEAM_LEADER');
  expect(roles).toContain('TEAM_MEM');
  expect(data.memberPending.length).toBeGreaterThan(0);
});
